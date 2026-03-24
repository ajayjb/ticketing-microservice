import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { OrderCreatedListener } from "../orderCreatedListener";
import { natsWrapper } from "@/services/nats.service";
import Ticket from "@/database/models/Ticket.model";
import {
  OrderCreatedEvent,
  OrderStatus,
  TicketUpdatedEvent,
} from "@ajayjbtickets/common";

const setup = async () => {
  // Create listener instance
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    name: "John Wick II",
    price: 10,
    createdBy: new Types.ObjectId().toString(),
  });

  await ticket.save();

  // Fake OrderCreated event
  const data: OrderCreatedEvent["data"] = {
    id: new Types.ObjectId().toString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new Types.ObjectId().toString(),
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // Fake NATS message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

describe("OrderCreatedListener", () => {
  describe("onMessage", () => {
    it("sets the orderId on the ticket when an order is created", async () => {
      const { listener, ticket, data, msg } = await setup();

      await listener.onMessage(data, msg);

      const updatedTicket = await Ticket.findById(ticket.id);

      expect(updatedTicket!.orderId?.toString()).toEqual(data.id);
    });

    it("acknowledges the message after successfully processing the event", async () => {
      const { listener, data, msg } = await setup();

      await listener.onMessage(data, msg);

      expect(msg.ack).toHaveBeenCalled();
    });

    it("published ticket updated event", async () => {
      const { listener, data, msg } = await setup();
      await listener.onMessage(data, msg);

      expect(natsWrapper.client.publish).toHaveBeenCalled();

      const parsedTicketData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
      ) as TicketUpdatedEvent["data"];

      expect(parsedTicketData.orderId).toEqual(data.id);
    });
  });
});
