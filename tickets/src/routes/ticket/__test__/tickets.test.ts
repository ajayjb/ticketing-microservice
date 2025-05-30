import request from "supertest";
import { Types } from "mongoose";
import { random } from "lodash";
import { randomUUID } from "crypto";
import app from "@/app";
import ROUTES from "@/config/routes";
import { ResponseStatusCode } from "@ajayjbtickets/common";

const server = app.server;

const createTicket = (
  cookie: string[],
  name: string,
  price: number
): Promise<any> => {
  return request(server)
    .post(ROUTES.TICKETS.CREATE)
    .set("Cookie", cookie)
    .send({ name, price });
};

describe("Create Ticket", () => {
  it(`returns ${ResponseStatusCode.UNAUTHORIZED} if user is not signed in`, async () => {
    await request(server)
      .post(ROUTES.TICKETS.CREATE)
      .send()
      .expect(ResponseStatusCode.UNAUTHORIZED);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if name or price is missing`, async () => {
    const cookie = global.signin();

    await request(server)
      .post(ROUTES.TICKETS.CREATE)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if name is missing`, async () => {
    const cookie = global.signin();

    await request(server)
      .post(ROUTES.TICKETS.CREATE)
      .set("Cookie", cookie)
      .send({
        price: 10,
      })
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if price is missing`, async () => {
    const cookie = global.signin();

    await request(server)
      .post(ROUTES.TICKETS.CREATE)
      .set("Cookie", cookie)
      .send({
        name: "Mission Impossible",
      })
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if price is negetive`, async () => {
    const cookie = global.signin();

    await request(server)
      .post(ROUTES.TICKETS.CREATE)
      .set("Cookie", cookie)
      .send({
        price: -10,
      })
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`creates tickets on valid input`, async () => {
    const cookie = global.signin();

    const name = "Mission Impossible";
    const price = 25;

    const response = await createTicket(cookie, name, price);
    expect(response.status).toBe(ResponseStatusCode.CREATED);

    const createdTicket = response.body;

    expect(createdTicket.data.name).toBe(name);
    expect(createdTicket.data.price).toBe(price);
  });
});

describe("Update Ticket", () => {
  it(`returns ${ResponseStatusCode.UNAUTHORIZED} if user is not signed in`, async () => {
    await request(server)
      .put(`${ROUTES.TICKETS.UPDATE}/${new Types.ObjectId()}`)
      .send({ name: "New Title", price: 20 })
      .expect(ResponseStatusCode.UNAUTHORIZED);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if ticket does not exist`, async () => {
    const cookie = global.signin();

    await request(server)
      .put(`${ROUTES.TICKETS.UPDATE}/${new Types.ObjectId()}`)
      .set("Cookie", cookie)
      .send({ name: "New Title", price: 20 })
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.FORBIDDEN} if user does not own the ticket`, async () => {
    const cookie = global.signin();
    const otherUserCookie = global.signin();

    const response = await createTicket(cookie, "Original", 15);
    expect(response.status).toBe(ResponseStatusCode.CREATED);

    const createdTicket = response.body;

    await request(server)
      .put(`${ROUTES.TICKETS.UPDATE}/${createdTicket.data.id}`)
      .set("Cookie", otherUserCookie)
      .send({ name: "Hacked Title", price: 30 })
      .expect(ResponseStatusCode.FORBIDDEN);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if invalid data is provided`, async () => {
    const cookie = global.signin();

    const response = await createTicket(cookie, "Original", 15);
    expect(response.status).toBe(ResponseStatusCode.CREATED);

    const createdTicket = response.body;

    await request(server)
      .put(`${ROUTES.TICKETS.UPDATE}/${createdTicket.data.id}`)
      .set("Cookie", cookie)
      .send({ name: "", price: -10 })
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.SUCCESS} and updates the ticket with valid data`, async () => {
    const cookie = global.signin();

    const response = await createTicket(cookie, "Original", 15);
    expect(response.status).toBe(ResponseStatusCode.CREATED);

    const createdTicket = response.body;

    const updatedName = "Updated Event";
    const updatedPrice = 25;

    const updateResponse = await request(server)
      .put(`${ROUTES.TICKETS.UPDATE}/${createdTicket.data.id}`)
      .set("Cookie", cookie)
      .send({ name: updatedName, price: updatedPrice })
      .expect(ResponseStatusCode.SUCCESS);

    expect(updateResponse.body.data.name).toBe(updatedName);
    expect(updateResponse.body.data.price).toBe(updatedPrice);
  });
});

describe("Delete Ticket", () => {
  it(`returns ${ResponseStatusCode.UNAUTHORIZED} if user is not signed in`, async () => {
    await request(server)
      .delete(`${ROUTES.TICKETS.REMOVE}/${new Types.ObjectId()}`)
      .send()
      .expect(ResponseStatusCode.UNAUTHORIZED);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if ticket does not exist`, async () => {
    const cookie = global.signin();

    await request(server)
      .delete(`${ROUTES.TICKETS.REMOVE}/${new Types.ObjectId()}`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.FORBIDDEN} if user does not own the ticket`, async () => {
    const cookie = global.signin();
    const otherUsercookie = global.signin();

    const response = await createTicket(cookie, "Delete Me", 99);
    expect(response.status).toBe(ResponseStatusCode.CREATED);

    const createdTicket = response.body;

    await request(server)
      .delete(`${ROUTES.TICKETS.REMOVE}/${createdTicket.data.id}`)
      .set("Cookie", otherUsercookie)
      .send()
      .expect(ResponseStatusCode.FORBIDDEN);
  });

  it(`returns ${ResponseStatusCode.SUCCESS} and deletes the ticket`, async () => {
    const cookie = global.signin();

    const response = await createTicket(cookie, "Delete Me", 99);
    expect(response.status).toBe(ResponseStatusCode.CREATED);

    const createdTicket = response.body;

    await request(server)
      .delete(`${ROUTES.TICKETS.REMOVE}/${createdTicket.data.id}`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.SUCCESS);

    await request(server)
      .get(`${ROUTES.TICKETS.FIND_BY_ID}/${createdTicket.data.id}`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.BAD_REQUEST);
  });
});

describe("Get Ticket By ID", () => {
  it(`returns ${ResponseStatusCode.UNAUTHORIZED} if user is not signed in`, async () => {
    await request(server)
      .get(`${ROUTES.TICKETS.FIND_BY_ID}/${new Types.ObjectId()}`)
      .send()
      .expect(ResponseStatusCode.UNAUTHORIZED);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if ticket not found`, async () => {
    const cookie = global.signin();

    await request(server)
      .get(`${ROUTES.TICKETS.FIND_BY_ID}/${new Types.ObjectId()}`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.SUCCESS} if ticket found`, async () => {
    const cookie = global.signin();

    const name = "Mission Impossible";
    const price = 10;

    const response = await createTicket(cookie, name, price);

    expect(response.status).toBe(ResponseStatusCode.CREATED);

    const ticketResponse = await request(server)
      .get(`${ROUTES.TICKETS.FIND_BY_ID}/${response.body.data.id}`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.SUCCESS);

    const { name: nameRes, price: priceRes } = ticketResponse.body.data;

    expect(nameRes).toBe(name);
    expect(priceRes).toBe(price);
  });
});

describe("Get Tickets", () => {
  it(`returns ${ResponseStatusCode.UNAUTHORIZED} if user is not signed in`, async () => {
    await request(server)
      .get(ROUTES.TICKETS.FIND_ALL)
      .send()
      .expect(ResponseStatusCode.UNAUTHORIZED);
  });

  it(`returns ${ResponseStatusCode.SUCCESS} with empty result when no tickets exist`, async () => {
    const cookie = global.signin();

    const response = await request(server)
      .get(`${ROUTES.TICKETS.FIND_ALL}?currentPage=1&itemsPerPage=10`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.SUCCESS);

    expect(response.body.pagination.totalItems).toBe(0);
    expect(response.body.data).toEqual([]);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if currentPage or itemsPerPage is invalid`, async () => {
    const cookie = global.signin();

    await request(server)
      .get(`${ROUTES.TICKETS.FIND_ALL}?currentPage=-1&itemsPerPage=10`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.BAD_REQUEST);

    await request(server)
      .get(`${ROUTES.TICKETS.FIND_ALL}?currentPage=abc&itemsPerPage=10`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.BAD_REQUEST);

    await request(server)
      .get(`${ROUTES.TICKETS.FIND_ALL}?currentPage=1&itemsPerPage=0`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`returns ${ResponseStatusCode.SUCCESS} if currentPage or itemsPerPage is not provided`, async () => {
    const cookie = global.signin();

    const totalItems = 5;
    const currentPage = 1;
    const itemsPerPage = 10;

    for (let i = 0; i < totalItems; i++) {
      const response = await createTicket(
        cookie,
        randomUUID(),
        random(0, 1000)
      );
      expect(response.status).toEqual(ResponseStatusCode.CREATED);
    }

    const response = await request(server)
      .get(
        `${ROUTES.TICKETS.FIND_ALL}?currentPage=${currentPage}&itemsPerPage=${itemsPerPage}`
      )
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.SUCCESS);

    const {
      currentPage: currentPageRes,
      itemsPerPage: itemsPerPageRes,
      totalItems: totalItemsRes,
    } = response.body.pagination;

    expect(response.body.data.length).toBe(totalItems);
    expect(Number(currentPageRes)).toBe(currentPage);
    expect(Number(itemsPerPageRes)).toBe(itemsPerPage);
    expect(Number(totalItemsRes)).toBe(totalItems);
  });

  it(`returns ${ResponseStatusCode.BAD_REQUEST} if itemsPerPage is greater than 100`, async () => {
    const cookie = global.signin();

    await request(server)
      .get(`${ROUTES.TICKETS.FIND_ALL}?currentPage=${1}&itemsPerPage=${101}`)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.BAD_REQUEST);
  });
});
