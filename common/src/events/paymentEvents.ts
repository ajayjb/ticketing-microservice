import { Subjects } from "./subjects";

interface PaymentCaptured {
  intentId: string;
  orderId: string;
  chargeId: string;
}

export interface PaymentCapturedEvent {
  subject: Subjects.PaymentCaptured;
  data: PaymentCaptured;
}
