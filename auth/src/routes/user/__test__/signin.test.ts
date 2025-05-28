import request from "supertest";
import app from "@/app";
import ROUTES from "@/config/routes";
import { ResponseStatusCode } from "@ajayjbtickets/common";

const server = app.server;

describe("Sign In", () => {
  it(`return ${ResponseStatusCode.UNAUTHORIZED} on if user does'nt exists`, async () => {
    await request(server)
      .post(ROUTES.USER.SIGNIN)
      .send({
        email: "ajayjb11@gmail.com",
        password: "Admin@123",
      })
      .expect(ResponseStatusCode.UNAUTHORIZED);
  });

  it(`return ${ResponseStatusCode.SUCCESS} on successful sign in`, async () => {
    await global.signin();
  });

  it(`return ${ResponseStatusCode.BAD_REQUEST} on invaild email`, async () => {
    await request(server)
      .post(ROUTES.USER.SIGNUP)
      .send({
        firstName: "Ajay J B",
        email: "ajayjb11@gmail.com",
        password: "Admin@123",
      })
      .expect(ResponseStatusCode.CREATED);

    await request(server)
      .post(ROUTES.USER.SIGNIN)
      .send({
        email: "ajayjb",
        password: "Admin@123",
      })
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`return ${ResponseStatusCode.UNAUTHORIZED} on invaild password`, async () => {
    await request(server)
      .post(ROUTES.USER.SIGNUP)
      .send({
        firstName: "Ajay J B",
        email: "ajayjb11@gmail.com",
        password: "Admin@123",
      })
      .expect(ResponseStatusCode.CREATED);

    await request(server)
      .post(ROUTES.USER.SIGNIN)
      .send({
        email: "ajayjb11@gmail.com",
        password: "Admin",
      })
      .expect(ResponseStatusCode.UNAUTHORIZED);
  });

  it(`return ${ResponseStatusCode.BAD_REQUEST} on email or password missing`, async () => {
    await request(server)
      .post(ROUTES.USER.SIGNUP)
      .send({
        firstName: "Ajay J B",
        email: "ajayjb11@gmail.com",
        password: "Admin@123",
      })
      .expect(ResponseStatusCode.CREATED);

    await request(server)
      .post(ROUTES.USER.SIGNIN)
      .send({
        email: "ajayjb",
      })
      .expect(ResponseStatusCode.BAD_REQUEST);

    await request(server)
      .post(ROUTES.USER.SIGNIN)
      .send({
        password: "Admin@123",
      })
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it("sets a cookie after successful signin", async () => {
    const cookie = await global.signin();

    expect(cookie).toBeDefined();
  });
});
