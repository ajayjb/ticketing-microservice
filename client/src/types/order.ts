import { Ticket } from "./ticket";

export enum OrderStatus {
  Created = "created",
  Cancelled = "cancelled",
  AwaitingPayment = "awaiting:payment",
  Complete = "complete",
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  expiresAt: string;
  ticket: Ticket;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
