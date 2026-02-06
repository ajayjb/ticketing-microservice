import { Message, Stan } from "node-nats-streaming";

import { Listener } from "@/events/baseListener";
import { TicketCreatedEvent } from "@/common/interfaces/tickets";
import { Subjects } from "@/common/enums/subjects";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = "ticket-service";

  onMessage(data: TicketCreatedEvent["data"], msg: Message): void {
    console.log(data, msg.getSequence());
    msg.ack();
  }

  constructor(client: Stan) {
    super(client);
    this.ackWait = 10 * 1000;
  }
}
