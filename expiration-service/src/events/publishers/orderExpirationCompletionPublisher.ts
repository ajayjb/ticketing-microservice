import {
  Publisher,
  Subjects,
  OrderExpirationCompleteEvent,
} from "@ajayjbtickets/common";

export class OrderExpirationCompletionPublisher extends Publisher<OrderExpirationCompleteEvent> {
  subject: Subjects.OrderExpirationComplete = Subjects.OrderExpirationComplete;
}
