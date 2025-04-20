import request from "supertest";
import app from "@/app";
import ROUTES from "@/config/routes";

const server = app.server;

it("clears cookie after signout", async () => {
  await global.signin();

  const response = await request(server).post(ROUTES.USER.SIGNOUT).expect(200);

  const cookie = response.get("Set-Cookie");

  if (!cookie) {
    throw new Error("Expected cookie but got undefined.");
  }

  expect(cookie[0]).toEqual(
    "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  );
});
