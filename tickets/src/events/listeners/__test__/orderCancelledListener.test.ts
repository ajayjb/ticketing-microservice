import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { natsWrapper } from "@/services/nats.service";
import Ticket from "@/database/models/Ticket.model";
import {
  OrderCancelledEvent,
  TicketUpdatedEvent,
} from "@ajayjbtickets/common";
import { OrderCancelledListener } from "../orderCancelledListener";

const setup = async () => {
  // Create listener instance
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    name: "John Wick II",
    price: 10,
    createdBy: new Types.ObjectId().toString(),
  });

  await ticket.save();

  // Fake OrderCancelled event
  const data: OrderCancelledEvent["data"] = {
    id: new Types.ObjectId().toString(),
    version: 1,
    ticket: {
      id: ticket.id,
    },
  };

  // Fake NATS message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

describe("OrderCancelledListener", () => {
  describe("onMessage", () => {
    it("sets the orderId as null on the ticket when an order is cancelled", async () => {
      const { listener, ticket, data, msg } = await setup();

      await listener.onMessage(data, msg);

      const updatedTicket = await Ticket.findById(ticket.id);

      expect(updatedTicket!.orderId).toEqual(null);
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
        (natsWrapper.client.publish as jest.Mock).mock.calls[2][1]
      ) as TicketUpdatedEvent["data"];

      expect(parsedTicketData.orderId).toEqual(null);
    });
  });
});
