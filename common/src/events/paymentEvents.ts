import { Subjects } from "./subjects";

interface PaymentCaptured {
  orderId: string;
}

export interface PaymentCapturedEvent {
  subject: Subjects.PaymentCaptured;
  data: PaymentCaptured;
}
