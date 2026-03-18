import { Message, Stan } from "node-nats-streaming";

import { QUEUE_GROUP_NAME } from "@/constants/queueGroupName";
import {
  Listener,
  OrderExpirationCompleteEvent,
  OrderStatus,
  Subjects,
} from "@ajayjbtickets/common";
import Order from "@/database/models/Order.model";
import { MESSAGES } from "@/constants/messages";
import { OrderCancelledPublisher } from "../publishers/orderCancelledPublisher";

export class OrderExpirationCompleteListener extends Listener<OrderExpirationCompleteEvent> {
  subject: Subjects.OrderExpirationComplete = Subjects.OrderExpirationComplete;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(
    data: OrderExpirationCompleteEvent["data"],
    msg: Message
  ): Promise<void> {
    const order = await Order.findById(data.orderId);

    if (!order) throw new Error(MESSAGES.ORDERS.NOT_FOUND);

    order.status = OrderStatus.Cancelled;
    await order.save();

    await new OrderCancelledPublisher(this.client).publish({
      id: order._id.toString(),
      ticket: {
        id: order.ticket.toString(),
      },
      version: order.version,
    });

    msg.ack();
  }

  constructor(client: Stan) {
    super(client);
    this.ackWait = 10 * 1000;
  }
}
