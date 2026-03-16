import { Subjects } from "./subjects";

interface Ticket {
  id: string;
  name: string;
  slug: string;
  price: number;
  createdBy: string;
  version: number;
  orderId?: string
}

export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: Ticket;
}

export interface TicketUpdatedEvent {
  subject: Subjects.TicketUpdated;
  data: Ticket;
}
