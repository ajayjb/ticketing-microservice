import request from "supertest";

import app from "@/app";
import ROUTES from "@/config/routes";
import { ResponseStatusCode } from "@ajayjbtickets/common";

const server = app.server;

describe("Create Ticket", () => {
  it(`return ${ResponseStatusCode.UNAUTHORIZED} if user is signed in`, async () => {
    await request(server)
      .post(ROUTES.TICKETS.CREATE)
      .send()
      .expect(ResponseStatusCode.UNAUTHORIZED);
  });

  it(`return ${ResponseStatusCode.BAD_REQUEST} if name or price is missing`, async () => {
    const cookie = global.signin();

    await request(server)
      .post(ROUTES.TICKETS.CREATE)
      .set("Cookie", cookie)
      .send()
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`return ${ResponseStatusCode.BAD_REQUEST} if name is missing`, async () => {
    const cookie = global.signin();

    await request(server)
      .post(ROUTES.TICKETS.CREATE)
      .set("Cookie", cookie)
      .send({
        price: 10,
      })
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`return ${ResponseStatusCode.BAD_REQUEST} if price is missing`, async () => {
    const cookie = global.signin();

    await request(server)
      .post(ROUTES.TICKETS.CREATE)
      .set("Cookie", cookie)
      .send({
        name: "Mission Impossible",
      })
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`return ${ResponseStatusCode.BAD_REQUEST} if price is negetive`, async () => {
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

    await request(server)
      .post(ROUTES.TICKETS.CREATE)
      .set("Cookie", cookie)
      .send({
        name: "Mission Impossible",
        price: 10,
      })
      .expect(ResponseStatusCode.CREATED);
  });
});
