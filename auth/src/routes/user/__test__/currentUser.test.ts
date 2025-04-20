import request from "supertest";
import app from "@/app";
import ROUTES from "@/config/routes";

const server = app.server;

it("responds with details about current user", async () => {
  const cookie = await global.signin();

  const currentUserResponse = await request(server)
    .get(ROUTES.USER.CURRENT_USER)
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(currentUserResponse.body.data.email).toEqual("ajayjb11@gmail.com");
});

it("responds with unauthorized if not authenticated", async () => {
  await request(server).get(ROUTES.USER.CURRENT_USER).send().expect(401);
});
