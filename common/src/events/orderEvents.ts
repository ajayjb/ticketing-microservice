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
}

interface OrderCancelled {
  id: string;
  ticket: {
    id: string;
  };
}

export interface OrderCreatedEvent {
  subject: Subjects.OrderCreated;
  data: OrderCreated;
}

export interface OrderCancelledEvent {
  subject: Subjects.OrderCancelled;
  data: OrderCancelled;
}
