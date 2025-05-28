import request from "supertest";
import app from "@/app";
import ROUTES from "@/config/routes";
import { ResponseStatusCode } from "@ajayjbtickets/common";

const server = app.server;

describe("Sign Up", () => {
  it(`return ${ResponseStatusCode.CREATED} on successful sign up`, async () => {
    return request(server)
      .post(ROUTES.USER.SIGNUP)
      .send({
        firstName: "Ajay J B",
        email: "ajayjb11@gmail.com",
        password: "Admin@123",
      })
      .expect(ResponseStatusCode.CREATED);
  });

  it(`return ${ResponseStatusCode.BAD_REQUEST} on invaild email`, async () => {
    return request(server)
      .post(ROUTES.USER.SIGNUP)
      .send({
        firstName: "Ajay J B",
        email: "ajayjb11.com",
        password: "Admin@123",
      })
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`return ${ResponseStatusCode.BAD_REQUEST} on invaild password`, async () => {
    return request(server)
      .post(ROUTES.USER.SIGNUP)
      .send({
        firstName: "Ajay J B",
        email: "ajayjb11@gmail.com",
        password: "Admin",
      })
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it(`return ${ResponseStatusCode.BAD_REQUEST} with missing firstName, email and password`, async () => {
    await request(server)
      .post(ROUTES.USER.SIGNUP)
      .send({ firstName: "Ajay J B" })
      .expect(ResponseStatusCode.BAD_REQUEST);
    await request(server)
      .post(ROUTES.USER.SIGNUP)
      .send({ email: "ajayjb11@gmail.com" })
      .expect(ResponseStatusCode.BAD_REQUEST);
    await request(server)
      .post(ROUTES.USER.SIGNUP)
      .send({ password: "Admin@123" })
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it("disallows duplicate emails", async () => {
    await request(server)
      .post(ROUTES.USER.SIGNUP)
      .send({
        firstName: "Ajay J B",
        email: "ajayjb11@gmail.com",
        password: "Admin@123",
      })
      .expect(ResponseStatusCode.CREATED);
    await request(server)
      .post(ROUTES.USER.SIGNUP)
      .send({
        firstName: "Ajay J B",
        email: "ajayjb11@gmail.com",
        password: "Admin@123",
      })
      .expect(ResponseStatusCode.BAD_REQUEST);
  });

  it("sets a cookie after successful signup", async () => {
    const response = await request(server)
      .post(ROUTES.USER.SIGNUP)
      .send({
        firstName: "Ajay J B",
        email: "ajayjb11@gmail.com",
        password: "Admin@123",
      })
      .expect(ResponseStatusCode.CREATED);

    expect(response.get("Set-Cookie")).toBeDefined();
  });
});
