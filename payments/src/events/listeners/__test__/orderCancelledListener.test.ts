import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { natsWrapper } from "@/services/nats.service";
import { OrderCancelledEvent, OrderStatus } from "@ajayjbtickets/common";
import { OrderCancelledListener } from "../orderCancelledListener";
import Order from "@/database/models/Order.model";

const setup = async () => {
  // Create listener instance
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create and save a order
  const order = Order.build({
    id: new Types.ObjectId().toString(),
    userId: new Types.ObjectId().toString(),
    price: 20,
    status: OrderStatus.Created,
  });

  await order.save();

  // Fake OrderCancelled event
  const data: OrderCancelledEvent["data"] = {
    id: order._id.toString(),
    version: order.version + 1,
    ticket: {
      id: new Types.ObjectId().toString(),
    },
  };

  // Fake NATS message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

describe("OrderCancelledListener", () => {
  describe("onMessage", () => {
    it("sets the order status as cancelled when an order is cancelled", async () => {
      const { listener, data, msg } = await setup();

      await listener.onMessage(data, msg);

      const order = await Order.findById(data.id);

      expect(order!._id.toString()).toEqual(data.id);
      expect(order!.status).toEqual(OrderStatus.Cancelled);
    });

    it("acknowledges the message after successfully processing the event", async () => {
      const { listener, data, msg } = await setup();

      await listener.onMessage(data, msg);

      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
