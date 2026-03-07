import {
  OrderCancelledEvent,
  Publisher,
  Subjects,
} from "@ajayjbtickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
