import { OrderUpdatedEvent, Publisher, Subjects } from "@ajayjbtickets/common";

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
  subject: Subjects.OrderUpdated = Subjects.OrderUpdated;
}
