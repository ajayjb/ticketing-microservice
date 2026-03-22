import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { OrderCreatedListener } from "../orderCreatedListener";
import { natsWrapper } from "@/services/nats.service";
import { OrderCreatedEvent, OrderStatus } from "@ajayjbtickets/common";
import Order from "@/database/models/Order.model";

const setup = async () => {
  // Create listener instance
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Fake OrderCreated event
  const data: OrderCreatedEvent["data"] = {
    id: new Types.ObjectId().toString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new Types.ObjectId().toString(),
    expiresAt: new Date().toISOString(),
    ticket: {
      id: new Types.ObjectId().toString(),
      price: 20,
    },
  };

  // Fake NATS message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

describe("OrderCreatedListener", () => {
  describe("onMessage", () => {
    it("creates a new order in the database when an OrderCreated event is received", async () => {
      const { listener, data, msg } = await setup();

      await listener.onMessage(data, msg);

      const order = await Order.findById(data.id);

      expect(order!._id.toString()).toEqual(data.id);
      expect(order!.price).toEqual(data.ticket.price);
    });

    it("acknowledges the message after successfully processing an OrderCreated event", async () => {
      const { listener, data, msg } = await setup();

      await listener.onMessage(data, msg);

      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
