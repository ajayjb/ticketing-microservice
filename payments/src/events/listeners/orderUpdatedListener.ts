import { Message } from "node-nats-streaming";

import { QUEUE_GROUP_NAME } from "@/constants/queueGroupName";
import {
  Subjects,
  Listener,
  OrderUpdatedEvent,
} from "@ajayjbtickets/common";
import Order from "@/database/models/Order.model";
import { Types } from "mongoose";
import { MESSAGES } from "@/constants/messages";

export class OrderUpdatedListener extends Listener<OrderUpdatedEvent> {
  subject: Subjects.OrderUpdated = Subjects.OrderUpdated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(
    data: OrderUpdatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const order = await Order.findOne({
      _id: new Types.ObjectId(data.id),
      version: data.version - 1,
    });

    if (!order) {
      throw new Error(MESSAGES.ORDERS.NOT_FOUND);
    }

    order.status = data.status;

    await order.save();

    msg.ack();
  }
}
