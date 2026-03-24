import request from "supertest";
import { Types } from "mongoose";
import { randomUUID } from "crypto";
import app from "@/app";
import ROUTES from "@/config/routes";
import { OrderStatus, ResponseStatusCode } from "@ajayjbtickets/common";
import { natsWrapper } from "@/services/nats.service";
import Ticket, { TicketDoc } from "@/database/models/Ticket.model";
import Order from "@/database/models/Order.model";
import slugify from "slugify";

const server = app.server;

const createOrder = (cookie: string[], ticketId: string): Promise<any> => {
  return request(server)
    .post(ROUTES.ORDERS.CREATE)
    .set("Cookie", cookie)
    .send({ ticketId });
};

const createTicket = (name: string): Promise<TicketDoc> => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toString(),
    name,
    slug: slugify(name),
    price: 30,
  }).save();

  return ticket;
};

describe("Create Order", () => {
  it(`returns ${ResponseStatusCode.UNAUTHORIZED} if user is not signed in`, async () => {
    await request(server)
      .post(ROUTES.ORDERS.CREATE)
      .send()
      .expect(ResponseStatusCode.UNAUTHORIZED);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if ticketId is missing`, async () => {
    const cookie = signin();

    const response = await request(server)
      .post(ROUTES.ORDERS.CREATE)
      .set("Cookie", cookie)
      .send({});

    expect(response.status).toBe(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if ticketId is invalid`, async () => {
    const cookie = signin();

    const response = await createOrder(cookie, "invalid-id");

    expect(response.status).toBe(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if ticket doesn't exist`, async () => {
    const cookie = signin();

    const ticketId = new Types.ObjectId();

    const response = await createOrder(cookie, ticketId.toString());

    expect(response.status).toBe(ResponseStatusCode.NOT_FOUND);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if order is already reserved by same user`, async () => {
    const cookie = signin();

    const ticket = await createTicket(randomUUID());

    await createOrder(cookie, ticket._id.toString());

    const response = await createOrder(cookie, ticket._id.toString());

    expect(response.status).toBe(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if ticket reserved by another user`, async () => {
    const userOne = signin();
    const userTwo = signin();

    const ticket = await createTicket(randomUUID());

    await createOrder(userOne, ticket._id.toString());

    const response = await createOrder(userTwo, ticket._id.toString());

    expect(response.status).toBe(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.SUCCESS} with valid inputs`, async () => {
    const cookie = signin();

    const ticket = await createTicket(randomUUID());

    const response = await createOrder(cookie, ticket._id.toString());

    expect(response.status).toBe(ResponseStatusCode.SUCCESS);
  });

  it("creates an order in the database", async () => {
    const cookie = signin();

    const ticket = await createTicket(randomUUID());

    await createOrder(cookie, ticket._id.toString());

    const orders = await Order.find({ ticket });

    expect(orders.length).toBe(1);
    expect(orders[0]!.ticket.toString()).toBe(ticket._id.toString());

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it("associates the order with the correct user", async () => {
    const cookie = signin();

    const ticket = await createTicket(randomUUID());

    const response = await createOrder(cookie, ticket._id.toString());

    const order = await Order.findById(response.body.data.id);

    expect(order).toBeDefined();
    expect(order!.userId).toBeDefined();
  });

  it("returns the ticket information in the response", async () => {
    const cookie = signin();

    const ticket = await createTicket(randomUUID());

    const response = await createOrder(cookie, ticket._id.toString());

    expect(response.body.data.ticket.toString()).toEqual(ticket._id.toString());
  });

  it("sets an expiration time for the order", async () => {
    const cookie = signin();

    const ticket = await createTicket(randomUUID());

    const response = await createOrder(cookie, ticket._id.toString());

    expect(response.body.data.expiresAt).toBeDefined();
  });
});

describe("Fetch Orders", () => {
  it(`returns ${ResponseStatusCode.UNAUTHORIZED} if user is not signed in`, async () => {
    await request(server)
      .get(ROUTES.ORDERS.FIND_BY_USER)
      .send()
      .expect(ResponseStatusCode.UNAUTHORIZED);
  });

  it("returns empty array if user has no orders", async () => {
    const cookie = signin();

    const response = await request(server)
      .get(ROUTES.ORDERS.FIND_BY_USER)
      .set("Cookie", cookie)
      .expect(ResponseStatusCode.SUCCESS);

    expect(response.body.data.length).toBe(0);
  });

  it("fetches orders for a particular user", async () => {
    const userOne = signin();
    const userTwo = signin();

    const ticket1 = await createTicket(randomUUID());
    const ticket2 = await createTicket(randomUUID());
    const ticket3 = await createTicket(randomUUID());

    await createOrder(userOne, ticket1._id.toString());
    await createOrder(userOne, ticket2._id.toString());

    await createOrder(userTwo, ticket3._id.toString());

    const response = await request(server)
      .get(ROUTES.ORDERS.FIND_BY_USER)
      .set("Cookie", userOne)
      .expect(ResponseStatusCode.SUCCESS);

    expect(response.body.data.length).toEqual(2);
  });

  it("does not return orders from other users", async () => {
    const userOne = signin();
    const userTwo = signin();

    const ticket1 = await createTicket(randomUUID());
    const ticket2 = await createTicket(randomUUID());

    await createOrder(userOne, ticket1._id.toString());
    await createOrder(userTwo, ticket2._id.toString());

    const response = await request(server)
      .get(ROUTES.ORDERS.FIND_BY_USER)
      .set("Cookie", userOne)
      .expect(ResponseStatusCode.SUCCESS);

    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].ticket.id.toString()).toEqual(
      ticket1._id.toString()
    );
  });

  it("returns ticket details in the order response", async () => {
    const cookie = signin();

    const ticket = await createTicket(randomUUID());

    await createOrder(cookie, ticket._id.toString());

    const response = await request(server)
      .get(ROUTES.ORDERS.FIND_BY_USER)
      .set("Cookie", cookie)
      .expect(ResponseStatusCode.SUCCESS);

    expect(response.body.data[0].ticket).toBeDefined();
    expect(response.body.data[0].ticket.id.toString()).toEqual(
      ticket._id.toString()
    );
    expect(response.body.data[0].ticket.price).toEqual(ticket.price);
  });
});

describe("Fetch Order By Id", () => {
  it(`returns ${ResponseStatusCode.UNAUTHORIZED} if user is not signed in`, async () => {
    const id = new Types.ObjectId();

    await request(server)
      .get(`${ROUTES.ORDERS.FIND_BY_ID}/${id}`)
      .send()
      .expect(ResponseStatusCode.UNAUTHORIZED);
  });

  it(`returns ${ResponseStatusCode.NOT_FOUND} if order does not exist`, async () => {
    const cookie = signin();
    const id = new Types.ObjectId();

    await request(server)
      .get(`${ROUTES.ORDERS.FIND_BY_ID}/${id}`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.NOT_FOUND);
  });

  it(`returns ${ResponseStatusCode.FORBIDDEN} if order belongs to another user`, async () => {
    const userOne = signin();
    const userTwo = signin();

    const ticket = await createTicket(randomUUID());

    const orderResponse = await createOrder(userOne, ticket._id.toString());

    await request(server)
      .get(`${ROUTES.ORDERS.FIND_BY_ID}/${orderResponse.body.data.id}`)
      .set("Cookie", userTwo)
      .send()
      .expect(ResponseStatusCode.FORBIDDEN);
  });

  it(`returns ${ResponseStatusCode.SUCCESS} if order belongs to the user`, async () => {
    const cookie = signin();

    const ticket = await createTicket(randomUUID());

    const orderResponse = await createOrder(cookie, ticket._id.toString());

    const response = await request(server)
      .get(`${ROUTES.ORDERS.FIND_BY_ID}/${orderResponse.body.data.id}`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.SUCCESS);

    expect(response.body.data.id).toEqual(orderResponse.body.data.id);
    expect(response.body.data.ticket.id.toString()).toEqual(
      ticket._id.toString()
    );
  });
});

describe("Cancel Order By Id", () => {
  it(`returns ${ResponseStatusCode.UNAUTHORIZED} if user is not signed in`, async () => {
    const id = new Types.ObjectId();

    await request(server)
      .delete(`${ROUTES.ORDERS.CANCEL}/${id}`)
      .send()
      .expect(ResponseStatusCode.UNAUTHORIZED);
  });

  it(`returns ${ResponseStatusCode.NOT_FOUND} if order does not exist`, async () => {
    const cookie = signin();
    const id = new Types.ObjectId();

    await request(server)
      .delete(`${ROUTES.ORDERS.CANCEL}/${id}`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.NOT_FOUND);
  });

  it(`returns ${ResponseStatusCode.FORBIDDEN} if order belongs to another user`, async () => {
    const userOne = signin();
    const userTwo = signin();

    const ticket = await createTicket(randomUUID());

    const orderResponse = await createOrder(userOne, ticket._id.toString());
    const orderId = orderResponse.body.data.id;

    await request(server)
      .delete(`${ROUTES.ORDERS.CANCEL}/${orderId}`)
      .set("Cookie", userTwo)
      .send()
      .expect(ResponseStatusCode.FORBIDDEN);
  });

  it(`cancels the order if it belongs to the user`, async () => {
    const cookie = signin();

    const ticket = await createTicket(randomUUID());

    const orderResponse = await createOrder(cookie, ticket._id.toString());
    const orderId = orderResponse.body.data.id;

    const cancelResponse = await request(server)
      .delete(`${ROUTES.ORDERS.CANCEL}/${orderId}`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.SUCCESS);

    expect(cancelResponse.body.data).toEqual(null);

    const orderCancelledResponse = await request(server)
      .get(`${ROUTES.ORDERS.FIND_BY_ID}/${orderId}`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.SUCCESS);

    expect(orderCancelledResponse.body.data.status).toEqual(
      OrderStatus.Cancelled
    );

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if order already cancelled`, async () => {
    const cookie = signin();

    const ticket = await createTicket(randomUUID());

    const orderResponse = await createOrder(cookie, ticket._id.toString());
    const orderId = orderResponse.body.data.id;

    await request(server)
      .delete(`${ROUTES.ORDERS.CANCEL}/${orderId}`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.SUCCESS);

    await request(server)
      .delete(`${ROUTES.ORDERS.CANCEL}/${orderId}`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if id is invalid`, async () => {
    const cookie = signin();

    await request(server)
      .delete(`${ROUTES.ORDERS.CANCEL}/invalid-id`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.BAD_REQUEST);
  });
});
