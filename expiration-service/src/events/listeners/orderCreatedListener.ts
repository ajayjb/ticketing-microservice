import { Message } from "node-nats-streaming";

import { QUEUE_GROUP_NAME } from "@/constants/queueGroupName";
import { Subjects, Listener, OrderCreatedEvent } from "@ajayjbtickets/common";
import { orderExpirationQueue } from "@/queues/orderExpirationQueue";
import { JOBS } from "@/constants/queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(
    data: OrderCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    await orderExpirationQueue.add(
      JOBS.ORDER.EXPIRE,
      { orderId: data.id },
      {
        delay: Math.max(
          0,
          30000
          // new Date(data.expiresAt).getTime() - new Date().getTime()
        ),
      }
    );

    msg.ack();
  }
}
