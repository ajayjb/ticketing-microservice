import { MESSAGES } from "@/constants/messages";
import Order from "@/database/models/Order.model";
import Ticket from "@/database/models/Ticket.model";
import { OrderCancelledPublisher } from "@/events/publishers/orderCancelledPublisher";
import { OrderCreatedPublisher } from "@/events/publishers/orderCreatedPublisher";
import { OrderUpdatedPublisher } from "@/events/publishers/orderUpdatedPublisher";
import { natsWrapper } from "@/services/nats.service";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  OrderStatus,
  ResponseStatusCode,
  SuccessResponse,
} from "@ajayjbtickets/common";
import { Request, Response } from "express";
import { Types } from "mongoose";

const ORDER_EXPIRATION_WINDOW_SECONDS = 15 * 60;

class OrdersController {
  constructor() {}

  async create(req: Request, res: Response) {
    const { ticketId } = req.body as { ticketId: string };
    const userId = req.user.id as string;

    const ticket = await Ticket.findOne({
      _id: new Types.ObjectId(ticketId),
      isDeleted: false,
    });

    if (!ticket) throw new NotFoundError(MESSAGES.TICKETS.NOT_FOUND);

    const existingOrder = await ticket.isReserved(
      new Types.ObjectId(userId as string)
    );

    if (existingOrder)
      throw new BadRequestError(MESSAGES.ORDERS.ALREADY_EXISTS);

    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + ORDER_EXPIRATION_WINDOW_SECONDS
    );

    const order = await Order.build({
      userId: userId,
      expiresAt,
      ticket: ticket._id,
    }).save();

    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order._id.toString(),
      status: order.status,
      expiresAt: order.expiresAt.toISOString(),
      userId: order.userId.toString(),
      ticket: {
        id: ticket._id.toString(),
        price: ticket.price,
      },
      version: order.version,
    });

    order.status = OrderStatus.AwaitingPayment;
    await order.save();

    await new OrderUpdatedPublisher(natsWrapper.client).publish({
      id: order._id.toString(),
      status: order.status,
      version: order.version,
    });

    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.ORDERS.CREATED,
      order
    ).send(res);
  }

  async findByUser(req: Request, res: Response) {
    const { id } = req.user;

    const orders = await Order.find({
      userId: id,
    })
      .sort({ createdAt: 1 })
      .populate([{ path: "ticket" }]);

    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.ORDERS.FETCHED,
      orders
    ).send(res);
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const user = req.user;

    if (!Types.ObjectId.isValid(id))
      throw new BadRequestError(MESSAGES.GENERAL.ID_MUST_BE_HEXADECIMAL);

    const order = await Order.findById(id).populate([{ path: "ticket" }]);

    if (!order) throw new NotFoundError(MESSAGES.ORDERS.NOT_FOUND);

    if (order?.userId?.toString() !== user?.id) throw new ForbiddenError();

    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.ORDERS.FETCHED,
      order
    ).send(res);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const user = req.user;

    if (!Types.ObjectId.isValid(id))
      throw new BadRequestError(MESSAGES.GENERAL.ID_MUST_BE_HEXADECIMAL);

    const order = await Order.findById(id);

    if (!order) throw new NotFoundError(MESSAGES.ORDERS.NOT_FOUND);

    if (order?.userId?.toString() !== user?.id) throw new ForbiddenError();

    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError(MESSAGES.ORDERS.ALREADY_CANCELLED);

    order.status = OrderStatus.Cancelled;

    await order.save();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order._id.toString(),
      ticket: {
        id: order.ticket.toString(),
      },
      version: order.version,
    });

    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.ORDERS.CANCELLED,
      null
    ).send(res);
  }
}

export default OrdersController;
