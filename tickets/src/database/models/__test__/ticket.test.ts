import { Types } from "mongoose";
import Ticket from "../Ticket.model";

describe("Implements optimistic cuncurrency control", () => {
  it("prevents saving stale updates when two instances modify the same ticket", async () => {
    const ticket = Ticket.build({
      name: "Mission Impossible I",
      price: 10,
      createdBy: new Types.ObjectId().toString(),
    });

    await ticket.save();

    const firstInstance = await Ticket.findById(ticket._id);
    const secondInstance = await Ticket.findById(ticket._id);

    firstInstance?.set({
      name: "Mission Impossible II",
    });

    secondInstance?.set({
      name: "Mission Impossible III",
    });

    await firstInstance!.save();

    try {
      await secondInstance!.save();
    } catch (error) {
      return;
    }

    throw new Error("Should not reach this point");
  });

  it("increments the version on each successful update", async () => {
    const ticket = Ticket.build({
      name: "Mission Impossible I",
      price: 10,
      createdBy: new Types.ObjectId().toString(),
    });

    await ticket.save();

    expect(ticket.version).toEqual(0);

    await ticket!.save();

    expect(ticket.version).toEqual(1);

    await ticket!.save();

    expect(ticket.version).toEqual(2);
  });
});
