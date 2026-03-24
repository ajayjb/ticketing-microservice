import {
  PaymentCapturedEvent,
  Publisher,
  Subjects,
} from "@ajayjbtickets/common";

export class PaymentCapturedPublisher extends Publisher<PaymentCapturedEvent> {
  subject: Subjects.PaymentCaptured = Subjects.PaymentCaptured;
}
