import { Message, Stan } from "node-nats-streaming";

import { QUEUE_GROUP_NAME } from "@/constants/queueGroupName";
import {
  Listener,
  OrderStatus,
  PaymentCapturedEvent,
  Subjects,
} from "@ajayjbtickets/common";
import Order from "@/database/models/Order.model";
import { MESSAGES } from "@/constants/messages";
import { OrderUpdatedPublisher } from "../publishers/orderUpdatedPublisher";

export class PaymentCapturedListener extends Listener<PaymentCapturedEvent> {
  subject: Subjects.PaymentCaptured = Subjects.PaymentCaptured;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(
    data: PaymentCapturedEvent["data"],
    msg: Message
  ): Promise<void> {
    const order = await Order.findById(data.orderId);

    if (!order) throw new Error(MESSAGES.ORDERS.NOT_FOUND);

    order.status = OrderStatus.Complete;

    await order.save();

    await new OrderUpdatedPublisher(this.client).publish({
      id: order._id.toString(),
      status: order.status,
      version: order.version,
    });

    msg.ack();
  }

  constructor(client: Stan) {
    super(client);
    this.ackWait = 10 * 1000;
  }
}
