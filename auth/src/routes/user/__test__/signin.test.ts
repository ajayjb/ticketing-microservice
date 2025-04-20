import request from "supertest";
import app from "@/app";
import ROUTES from "@/config/routes";

const server = app.server;

it("return 401 on if user does'nt exists", async () => {
  await request(server)
    .post(ROUTES.USER.SIGNIN)
    .send({
      email: "ajayjb11@gmail.com",
      password: "Admin@123",
    })
    .expect(401);
});

it("return 200 on successful sign in", async () => {
  await global.signin();
});

it("return 400 on invaild email", async () => {
  await request(server)
    .post(ROUTES.USER.SIGNUP)
    .send({
      first_name: "Ajay J B",
      email: "ajayjb11@gmail.com",
      password: "Admin@123",
    })
    .expect(201);

  await request(server)
    .post(ROUTES.USER.SIGNIN)
    .send({
      email: "ajayjb",
      password: "Admin@123",
    })
    .expect(400);
});

it("return 401 on invaild password", async () => {
  await request(server)
    .post(ROUTES.USER.SIGNUP)
    .send({
      first_name: "Ajay J B",
      email: "ajayjb11@gmail.com",
      password: "Admin@123",
    })
    .expect(201);

  await request(server)
    .post(ROUTES.USER.SIGNIN)
    .send({
      email: "ajayjb11@gmail.com",
      password: "Admin",
    })
    .expect(401);
});

it("return 400 on email or password missing", async () => {
  await request(server)
    .post(ROUTES.USER.SIGNUP)
    .send({
      first_name: "Ajay J B",
      email: "ajayjb11@gmail.com",
      password: "Admin@123",
    })
    .expect(201);

  await request(server)
    .post(ROUTES.USER.SIGNIN)
    .send({
      email: "ajayjb",
    })
    .expect(400);

  await request(server)
    .post(ROUTES.USER.SIGNIN)
    .send({
      password: "Admin@123",
    })
    .expect(400);
});

it("sets a cookie after successful signin", async () => {
  const cookie = await global.signin();
  
  expect(cookie).toBeDefined();
});
