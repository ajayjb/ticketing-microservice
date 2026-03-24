import request from "supertest";
import { Types } from "mongoose";
import { randomUUID } from "crypto";
import app from "@/app";
import ROUTES from "@/config/routes";
import { OrderStatus, ResponseStatusCode } from "@ajayjbtickets/common";
import Order from "@/database/models/Order.model";
import Payment, { PAYMENT_STATUS } from "@/database/models/Payment.model";
import { stripe } from "@/services/stripe.service";
import { natsWrapper } from "@/services/nats.service";

const server = app.server;

const createOrder = async ({ userId }: { userId: string }) => {
  return Order.build({
    id: new Types.ObjectId().toString(),
    status: OrderStatus.Created,
    userId,
    price: 25,
  }).save();
};

const webhookSetup = async (eventType: string) => {
  const order = await createOrder({
    userId: new Types.ObjectId().toString(),
  });

  const payment = await Payment.build({
    orderId: order._id.toString(),
    intentId: "pi_test_123",
    clientSecret: "secret",
    chargeId: "ch_test_123",
    amount: order.price,
    currency: "inr",
  }).save();

  (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
    type: eventType,
    data: {
      object: {
        id: "pi_test_123",
      },
    },
  });

  return { payment };
};

describe("Create Order", () => {
  it(`returns ${ResponseStatusCode.UNAUTHORIZED} if user is not signed in`, async () => {
    await request(server)
      .post(ROUTES.PAYMENTS.CREATE)
      .send()
      .expect(ResponseStatusCode.UNAUTHORIZED);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if token is missing`, async () => {
    const cookie = signin();

    const response = await request(server)
      .post(ROUTES.PAYMENTS.CREATE)
      .set("Cookie", cookie)
      .send({});

    expect(response.status).toBe(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if orderId is missing`, async () => {
    const cookie = signin();

    const response = await request(server)
      .post(ROUTES.PAYMENTS.CREATE)
      .set("Cookie", cookie)
      .send({
        token: randomUUID(),
      });

    expect(response.status).toBe(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if orderId is invalid`, async () => {
    const cookie = signin();

    const response = await request(server)
      .post(ROUTES.PAYMENTS.CREATE)
      .set("Cookie", cookie)
      .send({
        token: randomUUID(),
        orderId: randomUUID(),
      });

    expect(response.status).toBe(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.NOT_FOUND} if order doesn't exist`, async () => {
    const cookie = signin();

    const response = await request(server)
      .post(ROUTES.PAYMENTS.CREATE)
      .set("Cookie", cookie)
      .send({
        token: randomUUID(),
        orderId: new Types.ObjectId(),
      });

    expect(response.status).toBe(ResponseStatusCode.NOT_FOUND);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if order is not owned by the user`, async () => {
    const userId = new Types.ObjectId().toString();
    const userTwo = signin();

    const order = await createOrder({
      userId,
    });

    const response = await request(server)
      .post(ROUTES.PAYMENTS.CREATE)
      .set("Cookie", userTwo)
      .send({
        token: randomUUID(),
        orderId: order._id,
      });

    expect(response.status).toBe(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if order is cancelled`, async () => {
    const userId = new Types.ObjectId().toString();
    const cookie = signin(userId);

    const order = await createOrder({
      userId,
    });

    order.status = OrderStatus.Cancelled;

    await order.save();

    const response = await request(server)
      .post(ROUTES.PAYMENTS.CREATE)
      .set("Cookie", cookie)
      .send({
        token: randomUUID(),
        orderId: order._id,
      });

    expect(response.status).toBe(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.SUCCESS} with valid inputs`, async () => {
    const userId = new Types.ObjectId().toString();
    const cookie = signin(userId);

    const order = await createOrder({
      userId,
    });

    const response = await request(server)
      .post(ROUTES.PAYMENTS.CREATE)
      .set("Cookie", cookie)
      .send({
        orderId: order._id,
      });

    const paymentIntent = await Payment.findOne({
      orderId: order._id,
    });

    expect(stripe.paymentIntents.create).toHaveBeenCalled();
    expect(paymentIntent?.clientSecret).toEqual(
      response.body.data.clientSecret
    );
    expect(response.status).toBe(ResponseStatusCode.CREATED);
  });
});

describe("Stripe Webhook", () => {
  it("marks payment and order as complete on success", async () => {
    const { payment } = await webhookSetup("payment_intent.succeeded");

    await request(server)
      .post(ROUTES.PAYMENTS.STRIPE_WEBHOOK)
      .send({})
      .set("stripe-signature", "test-signature");

    const updatedPayment = await Payment.findById(payment.id);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    expect(updatedPayment!.status).toEqual(PAYMENT_STATUS.SUCCEEDED);
  });

  it("marks payment failed and order cancelled", async () => {
    const { payment } = await webhookSetup("payment_intent.payment_failed");

    await request(server)
      .post(ROUTES.PAYMENTS.STRIPE_WEBHOOK)
      .send({})
      .set("stripe-signature", "test-signature");

    const updatedPayment = await Payment.findById(payment.id);

    expect(updatedPayment!.status).toEqual(PAYMENT_STATUS.FAILED);
  });

  it("marks payment cancelled and order cancelled", async () => {
    const { payment } = await webhookSetup("payment_intent.canceled");

    await request(server)
      .post(ROUTES.PAYMENTS.STRIPE_WEBHOOK)
      .send({})
      .set("stripe-signature", "test-signature");

    const updatedPayment = await Payment.findById(payment.id);

    expect(updatedPayment!.status).toEqual(PAYMENT_STATUS.CANCELLED);
  });

  it(`returns ${ResponseStatusCode.SUCCESS} even if payment not found`, async () => {
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "non_existing",
        },
      },
    });

    const res = await request(server)
      .post(ROUTES.PAYMENTS.STRIPE_WEBHOOK)
      .send({})
      .set("stripe-signature", "test-signature");

    expect(res.status).toBe(ResponseStatusCode.SUCCESS);
  });

  it(`returns ${ResponseStatusCode.SUCCESS} even if order not found`, async () => {
    await Payment.build({
      orderId: new Types.ObjectId().toString(),
      intentId: "pi_test_123",
      clientSecret: "secret",
      chargeId: "ch_test_123",
      amount: 20,
      currency: "inr",
    }).save();

    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_test_123",
        },
      },
    });

    const res = await request(server)
      .post(ROUTES.PAYMENTS.STRIPE_WEBHOOK)
      .send({})
      .set("stripe-signature", "test-signature");

    expect(res.status).toBe(ResponseStatusCode.SUCCESS);
  });

  it("does not update twice if already succeeded", async () => {
    const { payment } = await webhookSetup("payment_intent.succeeded");

    payment.set({ status: PAYMENT_STATUS.SUCCEEDED });
    await payment.save();

    await request(server)
      .post(ROUTES.PAYMENTS.STRIPE_WEBHOOK)
      .send({})
      .set("stripe-signature", "test-signature");

    expect(natsWrapper.client.publish).not.toHaveBeenCalled();

    const updated = await Payment.findById(payment.id);

    expect(updated!.status).toEqual(PAYMENT_STATUS.SUCCEEDED);
  });
});
