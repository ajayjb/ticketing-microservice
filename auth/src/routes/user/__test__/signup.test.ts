import request from "supertest";
import app from "@/app";
import ROUTES from "@/config/routes";

const server = app.server;

it("return 201 on successful sign up", async () => {
  return request(server)
    .post(ROUTES.USER.SIGNUP)
    .send({
      first_name: "Ajay J B",
      email: "ajayjb11@gmail.com",
      password: "Admin@123",
    })
    .expect(201);
});

it("return 400 on invaild email", async () => {
  return request(server)
    .post(ROUTES.USER.SIGNUP)
    .send({
      first_name: "Ajay J B",
      email: "ajayjb11.com",
      password: "Admin@123",
    })
    .expect(400);
});

it("return 400 on invaild password", async () => {
  return request(server)
    .post(ROUTES.USER.SIGNUP)
    .send({
      first_name: "Ajay J B",
      email: "ajayjb11@gmail.com",
      password: "Admin",
    })
    .expect(400);
});

it("return 400 with missing first_name, email and password", async () => {
  await request(server)
    .post(ROUTES.USER.SIGNUP)
    .send({ first_name: "Ajay J B" })
    .expect(400);
  await request(server)
    .post(ROUTES.USER.SIGNUP)
    .send({ email: "ajayjb11@gmail.com" })
    .expect(400);
  await request(server)
    .post(ROUTES.USER.SIGNUP)
    .send({ password: "Admin@123" })
    .expect(400);
});

it("disallows duplicate emails", async () => {
  await request(server)
    .post(ROUTES.USER.SIGNUP)
    .send({
      first_name: "Ajay J B",
      email: "ajayjb11@gmail.com",
      password: "Admin@123",
    })
    .expect(201);
  await request(server)
    .post(ROUTES.USER.SIGNUP)
    .send({
      first_name: "Ajay J B",
      email: "ajayjb11@gmail.com",
      password: "Admin@123",
    })
    .expect(400);
});

it("sets a cookie after successful signup", async () => {
  const response = await request(server)
    .post(ROUTES.USER.SIGNUP)
    .send({
      first_name: "Ajay J B",
      email: "ajayjb11@gmail.com",
      password: "Admin@123",
    })
    .expect(201);

  expect(response.get("Set-Cookie")).toBeDefined();
});
