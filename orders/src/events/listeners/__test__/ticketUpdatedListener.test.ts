import { Types } from "mongoose";
import slugify from "slugify";
import { Message } from "node-nats-streaming";

import { natsWrapper } from "@/services/nats.service";
import { TicketUpdatedEvent } from "@ajayjbtickets/common";
import Ticket from "@/database/models/Ticket.model";
import { TicketUpdatedListner } from "../ticketUpdatedListner";

const setup = async () => {
  // Create listener instance
  const listener = new TicketUpdatedListner(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new Types.ObjectId().toString(),
    name: "John Wick III",
    slug: slugify("John Wick II"),
    price: 20,
  });

  await ticket.save();

  // Fake TicketUpdated event
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    name: "John Wick III",
    slug: slugify("John Wick III"),
    price: 999,
    createdBy: new Types.ObjectId().toString(),
  };

  // Fake NATS message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, listener };
};

describe("TicketUpdatedListener", () => {
  describe("onMessage", () => {
    it("finds, updates, and saves the ticket when a TicketUpdated event is received", async () => {
      const { msg, data, ticket, listener } = await setup();

      await listener.onMessage(data, msg);

      const updatedTicket = await Ticket.findById(ticket.id);

      expect(updatedTicket!.name).toEqual(data.name);
      expect(updatedTicket!.price).toEqual(data.price);
      expect(updatedTicket!.version).toEqual(data.version);
    });

    it("acknowledges the message after successfully updating the ticket", async () => {
      const { msg, data, listener } = await setup();

      await listener.onMessage(data, msg);

      expect(msg.ack).toHaveBeenCalled();
    });

    it("does not acknowledge the message if the event has a skipped version number", async () => {
      const { msg, data, listener } = await setup();

      data.version = 10;

      try {
        await listener.onMessage(data, msg);
      } catch (error) {}

      expect(msg.ack).not.toHaveBeenCalled();
    });
  });
});
