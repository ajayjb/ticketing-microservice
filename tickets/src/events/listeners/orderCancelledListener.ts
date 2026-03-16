import { Message } from "node-nats-streaming";

import { QUEUE_GROUP_NAME } from "@/constants/queueGroupName";
import { Listener, OrderCancelledEvent, Subjects } from "@ajayjbtickets/common";
import { MESSAGES } from "@/constants/messages";
import Ticket from "@/database/models/Ticket.model";
import { TicketUpdatedPublisher } from "../publishers/ticketUpdatedPublisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error(MESSAGES.TICKETS.NOT_FOUND);
    }

    ticket.orderId = null;

    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket._id.toString(),
      name: ticket.name,
      slug: ticket.slug,
      price: ticket.price,
      createdBy: ticket.createdBy.toString(),
      version: ticket.version,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}
