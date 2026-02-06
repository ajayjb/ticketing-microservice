import { Subjects } from "../enums/subjects";

export interface Ticket {
  id: number;
  title: string;
  price: number;
}

export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: Ticket;
}
