import { Types } from "mongoose";
import slugify from "slugify";
import { Message } from "node-nats-streaming";

import { natsWrapper } from "@/services/nats.service";
import {
  OrderStatus,
  OrderUpdatedEvent,
  PaymentCapturedEvent,
} from "@ajayjbtickets/common";
import Ticket from "@/database/models/Ticket.model";
import Order from "@/database/models/Order.model";
import { PaymentCapturedListener } from "../paymentCapturedListener";

const setup = async () => {
  // Create listener instance
  const listener = new PaymentCapturedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new Types.ObjectId().toString(),
    name: "John Wick III",
    slug: slugify("John Wick II"),
    price: 20,
  });

  await ticket.save();

  // Create and save a order
  const order = await Order.build({
    userId: new Types.ObjectId().toString(),
    expiresAt: new Date(),
    ticket: ticket._id,
  }).save();

  const data: PaymentCapturedEvent["data"] = {
    orderId: order._id.toString(),
    intentId: "pi-test-123",
    chargeId: "ch-test-123",
  };

  // Fake NATS message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, listener };
};

describe("PaymentCapturedListener", () => {
  describe("onMessage", () => {
    it("completes order when a PaymentCapturedListener event is received", async () => {
      const { listener, data, msg } = await setup();

      await listener.onMessage(data, msg);

      const order = await Order.findById(data.orderId);

      expect(order?.status).toEqual(OrderStatus.Complete);
    });

    it("acknowledges the message after successfully cancelling the order", async () => {
      const { data, listener, msg } = await setup();

      await listener.onMessage(data, msg);

      expect(msg.ack).toHaveBeenCalled();
    });

    it("published order updated event", async () => {
      const { listener, data, msg } = await setup();
      await listener.onMessage(data, msg);

      expect(natsWrapper.client.publish).toHaveBeenCalled();

      const parsedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
      ) as OrderUpdatedEvent["data"];

      expect(parsedData.id).toEqual(data.orderId);
    });
  });
});
