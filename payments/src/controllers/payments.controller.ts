import { sanitizedConfig } from "@/config/config";
import { MESSAGES } from "@/constants/messages";
import Order from "@/database/models/Order.model";
import Payment, { PAYMENT_STATUS } from "@/database/models/Payment.model";
import { PaymentCapturedPublisher } from "@/events/publishers/paymentCapturedPublisher";
import { natsWrapper } from "@/services/nats.service";
import { stripe } from "@/services/stripe.service";
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  ResponseStatusCode,
  SuccessResponse,
} from "@ajayjbtickets/common";
import { Request, Response } from "express";

class PaymentsController {
  constructor() {}

  async create(req: Request, res: Response) {
    const { orderId } = req.body as { token: string; orderId: string };
    const userId = req.user.id as string;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError(MESSAGES.ORDERS.NOT_FOUND);
    }

    if (order.userId.toString() !== userId.toString()) {
      throw new BadRequestError(MESSAGES.ORDERS.ORDER_NOT_OWNED);
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError(MESSAGES.ORDERS.ORDER_CANCELLED);
    }

    if (order.status === OrderStatus.Complete) {
      throw new BadRequestError(MESSAGES.ORDERS.ORDER_ALREADY_PAID);
    }

    const currency = "inr";
    const amount = order.price * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description: `Payment for order ${orderId}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    await Payment.build({
      orderId,
      intentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: order.price,
      currency,
    }).save();

    new SuccessResponse(
      ResponseStatusCode.CREATED,
      MESSAGES.PAYMENTS.INTENT_CREATED,
      {
        clientSecret: paymentIntent.client_secret,
      },
    ).send(res);
  }

  handleStripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        sanitizedConfig.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.log(err);
    }

    const data = event.data.object as any;

    const payment = await Payment.findOne({
      intentId: data.id,
    });

    if (!payment) {
      return new SuccessResponse(
        ResponseStatusCode.SUCCESS,
        MESSAGES.PAYMENTS.INTENT_NOT_OUND,
        null,
      ).send(res);
    }

    const order = await Order.findById(payment!.orderId);

    if (!order) {
      return new SuccessResponse(
        ResponseStatusCode.SUCCESS,
        MESSAGES.ORDERS.NOT_FOUND,
        null,
      ).send(res);
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        if (payment!.status === PAYMENT_STATUS.SUCCEEDED) break;

        payment!.set({
          status: PAYMENT_STATUS.SUCCEEDED,
          chargeId: data.latest_charge,
        });
        await payment!.save();

        await new PaymentCapturedPublisher(natsWrapper.client).publish({
          orderId: payment.orderId.toString(),
          chargeId: payment.chargeId,
          intentId: payment.intentId,
        });
        break;
      }
      case "payment_intent.payment_failed": {
        if (payment!.status === PAYMENT_STATUS.FAILED) break;

        payment!.set({ status: PAYMENT_STATUS.FAILED });
        await payment!.save();
        break;
      }
      case "payment_intent.canceled": {
        if (payment!.status === PAYMENT_STATUS.CANCELLED) break;

        payment!.set({ status: PAYMENT_STATUS.CANCELLED });
        await payment!.save();
        break;
      }
      default:
        console.log("Unhandled event:", event.type);
    }

    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.PAYMENTS.CAPTURED,
      {
        received: true,
      },
    ).send(res);
  };
}

export default PaymentsController;
