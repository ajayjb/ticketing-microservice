import { Subjects } from "@/common/enums/subjects";
import { Publisher } from "./basePublisher";
import { TicketCreatedEvent } from "@/common/interfaces/tickets";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
