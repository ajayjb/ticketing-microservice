import { Message } from "node-nats-streaming";
import { Types } from "mongoose";

import { QUEUE_GROUP_NAME } from "@/constants/queueGroupName";
import { Subjects, Listener, OrderCreatedEvent } from "@ajayjbtickets/common";
import Ticket from "@/database/models/Ticket.model";
import { MESSAGES } from "@/constants/messages";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(
    data: OrderCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error(MESSAGES.TICKETS.NOT_FOUND);
    }

    ticket.orderId = new Types.ObjectId(data.id);

    await ticket.save();

    msg.ack();
  }
}
