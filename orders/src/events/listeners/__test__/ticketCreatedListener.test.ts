import { Types } from "mongoose";
import slugify from "slugify";
import { Message } from "node-nats-streaming";

import { natsWrapper } from "@/services/nats.service";
import { TicketCreatedListener } from "../ticketCreatedListener";
import { TicketCreatedEvent } from "@ajayjbtickets/common";
import Ticket from "@/database/models/Ticket.model";

const setup = async () => {
  // Create listener instance
  const listener = new TicketCreatedListener(natsWrapper.client);

  // Fake TicketCreated event
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: new Types.ObjectId().toString(),
    name: "John Wick II",
    slug: slugify("John Wick II"),
    price: 10,
    createdBy: new Types.ObjectId().toString(),
    isDeleted: false,
  };

  // Fake NATS message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

describe("TicketCreatedListener", () => {
  describe("onMessage", () => {
    it("creates and saves a ticket when a TicketCreated event is received", async () => {
      const { listener, data, msg } = await setup();

      await listener.onMessage(data, msg);

      const ticket = await Ticket.findById(data.id);

      expect(ticket).toBeDefined();
      expect(ticket!.name).toEqual(data.name);
      expect(ticket!.price).toEqual(data.price);
    });

    it("acknowledges the message after successfully creating the ticket", async () => {
      const { data, listener, msg } = await setup();

      await listener.onMessage(data, msg);

      expect(msg.ack).toHaveBeenCalled();
    });
  });
});
