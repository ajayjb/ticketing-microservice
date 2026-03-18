import { OrderStatus } from "..";
import { Subjects } from "./subjects";

interface OrderCreated {
  id: string;
  status: OrderStatus;
  expiresAt: string;
  userId: string;
  ticket: {
    id: string;
    price: number;
  };
  version: number;
}

interface OrderCancelled {
  id: string;
  ticket: {
    id: string;
  };
  version: number;
}

interface OrderExpired {
  orderId: string;
}

export interface OrderCreatedEvent {
  subject: Subjects.OrderCreated;
  data: OrderCreated;
}

export interface OrderCancelledEvent {
  subject: Subjects.OrderCancelled;
  data: OrderCancelled;
}

export interface OrderExpirationCompleteEvent {
  subject: Subjects.OrderExpirationComplete;
  data: OrderExpired;
}
