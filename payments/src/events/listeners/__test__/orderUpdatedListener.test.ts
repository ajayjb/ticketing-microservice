import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { natsWrapper } from "@/services/nats.service";
import { OrderStatus, OrderUpdatedEvent } from "@ajayjbtickets/common";
import Order from "@/database/models/Order.model";
import { OrderUpdatedListener } from "../orderUpdatedListener";

const setup = async () => {
  // Create listener instance
  const listener = new OrderUpdatedListener(natsWrapper.client);

  // Create and save a order
  const order = Order.build({
    id: new Types.ObjectId().toString(),
    userId: new Types.ObjectId().toString(),
    price: 20,
    status: OrderStatus.Created,
  });

  await order.save();

  // Fake OrderCancelled event
  const data: OrderUpdatedEvent["data"] = {
    id: order._id.toString(),
    status: OrderStatus.Complete,
    version: order.version + 1,
  };

  // Fake NATS message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

describe("OrderUpdatedListener", () => {
  describe("onMessage", () => {
    it("sets the order status as complete when an order is completed", async () => {
      const { listener, data, msg } = await setup();

      await listener.onMessage(data, msg);

      const order = await Order.findById(data.id);

      expect(order!._id.toString()).toEqual(data.id);
      expect(order!.status).toEqual(OrderStatus.Complete);
    });

    it("acknowledges the message after successfully processing the event", async () => {
      const { listener, data, msg } = await setup();

      await listener.onMessage(data, msg);

      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
