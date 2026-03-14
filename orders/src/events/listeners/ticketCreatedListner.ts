import { Message, Stan } from "node-nats-streaming";

import { QUEUE_GROUP_NAME } from "@/constants/queueGroupName";
import { Listener, Subjects, TicketCreatedEvent } from "@ajayjbtickets/common";
import Ticket from "@/database/models/Ticket.model";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = QUEUE_GROUP_NAME;
  async onMessage(
    data: TicketCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    await Ticket.build({
      id: data.id,
      name: data.name,
      slug: data.slug,
      price: data.price,
    }).save();

    msg.ack();
  }

  constructor(client: Stan) {
    super(client);
    this.ackWait = 10 * 1000;
  }
}
