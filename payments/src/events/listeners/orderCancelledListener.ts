import { Message } from "node-nats-streaming";

import { QUEUE_GROUP_NAME } from "@/constants/queueGroupName";
import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@ajayjbtickets/common";
import Order from "@/database/models/Order.model";
import { MESSAGES } from "@/constants/messages";
import { Types } from "mongoose";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const order = await Order.findOne({
      _id: new Types.ObjectId(data.id),
      version: data.version - 1,
    });

    if (!order) {
      throw new Error(MESSAGES.ORDERS.NOT_FOUND);
    }

    order.status = OrderStatus.Cancelled;

    await order.save();

    msg.ack();
  }
}
