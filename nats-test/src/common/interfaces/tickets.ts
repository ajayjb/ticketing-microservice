import { Subjects } from "../enums/subjects";

export interface Ticket {
  id: number;
  name: string;
  price: number;
}

export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: Ticket;
}
