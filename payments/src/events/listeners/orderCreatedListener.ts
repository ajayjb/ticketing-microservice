import { Message } from "node-nats-streaming";

import { QUEUE_GROUP_NAME } from "@/constants/queueGroupName";
import { Subjects, Listener, OrderCreatedEvent } from "@ajayjbtickets/common";
import Order from "@/database/models/Order.model";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(
    data: OrderCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    await Order.build({
      id: data.id,
      status: data.status,
      userId: data.userId,
      price: data.ticket.price,
    }).save();

    msg.ack();
  }
}
