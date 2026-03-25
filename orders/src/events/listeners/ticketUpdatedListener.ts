import { Message, Stan } from "node-nats-streaming";
import { Types } from "mongoose";

import { QUEUE_GROUP_NAME } from "@/constants/queueGroupName";
import { Listener, Subjects, TicketUpdatedEvent } from "@ajayjbtickets/common";
import Ticket from "@/database/models/Ticket.model";
import { MESSAGES } from "@/constants/messages";

export class TicketUpdatedListner extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(
    data: TicketUpdatedEvent["data"],
    msg: Message,
  ): Promise<void> {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error(MESSAGES.TICKETS.NOT_FOUND);
    }

    ticket.name = data.name;
    ticket.slug = data.slug;
    ticket.price = data.price;
    ticket.isDeleted = data.isDeleted;

    await ticket.save();

    msg.ack();
  }

  constructor(client: Stan) {
    super(client);
    this.ackWait = 10 * 1000;
  }
}
