import { Subjects } from "./subjects";

interface Ticket {
  id: string;
  name: string;
  price: number;
  userId: string;
}

export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: Ticket;
}

export interface TicketUpdatedEvent {
  subject: Subjects.TicketUpdated;
  data: Ticket;
}
