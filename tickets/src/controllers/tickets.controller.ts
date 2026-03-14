import { MESSAGES } from "@/constants/messages";
import Ticket from "@/database/models/Ticket.model";
import { TicketCreatedPublisher } from "@/events/publishers/ticketCreatedPublisher";
import { TicketUpdatedPublisher } from "@/events/publishers/ticketUpdatedPublisher";
import { natsWrapper } from "@/services/nats.service";
import {
  BadRequestError,
  ForbiddenError,
  JwtPayload,
  Pagination,
  ResponseStatusCode,
  SuccessResponse,
  sanitizeObject,
} from "@ajayjbtickets/common";
import { Request, Response } from "express";
import { Types } from "mongoose";

class TicketsController {
  constructor() {}

  async create(req: Request, res: Response) {
    const { name, price } = req.body as { name: string; price: number };
    const user = req.user as JwtPayload;

    const ticketNameExists = await Ticket.exists({ name });

    if (ticketNameExists) {
      throw new BadRequestError(MESSAGES.TICKETS.TICKET_NAME_EXISTS);
    }

    const ticket = await Ticket.build({
      name,
      price,
      createdBy: user.id,
    }).save();

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket._id.toString(),
      name: ticket.name,
      slug: ticket.slug,
      price: ticket.price,
      createdBy: ticket.createdBy.toString(),
    });

    new SuccessResponse(
      ResponseStatusCode.CREATED,
      MESSAGES.TICKETS.CREATED,
      ticket
    ).send(res);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const user = req.user;

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError(MESSAGES.GENERAL.ID_MUST_BE_HEXADECIMAL);
    }

    const { name, price } = req.body as { name: string; price: number };

    const ticket = await Ticket.findOne({
      _id: new Types.ObjectId(id),
      isDeleted: false,
    });

    if (!ticket) {
      throw new BadRequestError(MESSAGES.TICKETS.NOT_FOUND);
    }

    if (ticket.createdBy.toString() !== user.id) {
      throw new ForbiddenError();
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      sanitizeObject({
        name,
        price,
      }),
      { new: true }
    ).lean();

    if (updatedTicket) {
      await new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: updatedTicket?._id.toString(),
        name: updatedTicket.name,
        slug: ticket.slug,
        price: updatedTicket.price,
        createdBy: updatedTicket.createdBy.toString(),
      });
    }

    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.TICKETS.UPDATED,
      updatedTicket
    ).send(res);
  }

  async findAll(req: Request, res: Response) {
    const { currentPage = 1, itemsPerPage = 10 } = req.query as unknown as {
      currentPage: number;
      itemsPerPage: number;
    };

    const baseMatch: Record<string, any> = {
      isDeleted: false,
    };

    const [tickets, totalItems] = await Promise.all([
      Ticket.find(baseMatch)
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .lean(),
      Ticket.countDocuments(baseMatch),
    ]);

    const pagination: Pagination = {
      currentPage,
      itemsPerPage,
      totalItems,
    };

    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.GENERAL.SUCCESS,
      tickets,
      pagination
    ).send(res);
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params as { id: string };

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError(MESSAGES.GENERAL.ID_MUST_BE_HEXADECIMAL);
    }

    const ticket = await Ticket.findOne({
      _id: new Types.ObjectId(id),
      isDeleted: false,
    }).lean();

    if (!ticket) {
      throw new BadRequestError(MESSAGES.TICKETS.NOT_FOUND);
    }

    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.GENERAL.SUCCESS,
      ticket
    ).send(res);
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const user = req.user as JwtPayload;

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError(MESSAGES.GENERAL.ID_MUST_BE_HEXADECIMAL);
    }

    const ticket = await Ticket.findOne({
      _id: new Types.ObjectId(id),
      isDeleted: false,
    });

    if (!ticket) {
      throw new BadRequestError(MESSAGES.TICKETS.NOT_FOUND);
    }

    if (ticket.createdBy.toString() !== user.id) {
      throw new ForbiddenError();
    }

    ticket.isDeleted = true;
    await ticket.save();

    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.TICKETS.REMOVED,
      null
    ).send(res);
  }
}

export default TicketsController;
