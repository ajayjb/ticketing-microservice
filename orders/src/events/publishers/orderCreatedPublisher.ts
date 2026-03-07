import { OrderCreatedEvent, Publisher, Subjects } from "@ajayjbtickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
