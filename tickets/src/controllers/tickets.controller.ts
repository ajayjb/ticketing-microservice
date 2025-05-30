import { MESSAGES } from "@/constants/messages";
import Ticket from "@/database/models/Ticket.model";
import {
  BadRequestError,
  JwtPayload,
  ResponseStatusCode,
  SuccessResponse,
  sanitizeObject,
} from "@ajayjbtickets/common";
import { Request, Response } from "express";

class TicketsController {
  constructor() {}

  async create(req: Request, res: Response) {
    const { name, price } = req.body as { name: string; price: number };
    const user = req.user as JwtPayload;

    const ticket = await Ticket.build({
      name,
      price,
      userId: user.id,
    }).save();

    new SuccessResponse(
      ResponseStatusCode.CREATED,
      MESSAGES.TICKETS.CREATED,
      ticket
    ).send(res);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const { name, price } = req.body as { name: string; price: number };

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      sanitizeObject({
        name,
        price,
      }),
      { new: true }
    );

    if (!ticket) {
      throw new BadRequestError(MESSAGES.TICKETS.NOT_FOUND);
    }

    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.TICKETS.UPDATED,
      ticket
    ).send(res);
  }

  async findAll(req: Request, res: Response) {
    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.GENERAL.SUCCESS,
      null
    ).send(res);
  }

  async findById(req: Request, res: Response) {
    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.GENERAL.SUCCESS,
      null
    ).send(res);
  }

  async remove(req: Request, res: Response) {
    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.TICKETS.REMOVED,
      null
    ).send(res);
  }
}

export default TicketsController;
