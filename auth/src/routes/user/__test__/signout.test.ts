import request from "supertest";
import app from "@/app";
import ROUTES from "@/config/routes";
import { ResponseStatusCode } from "@ajayjbtickets/common";

const server = app.server;

describe("Sign Out", () => {
  it("clears cookie after signout", async () => {
    await global.signin();

    const response = await request(server)
      .post(ROUTES.USER.SIGNOUT)
      .expect(ResponseStatusCode.SUCCESS);

    const cookie = response.get("Set-Cookie");

    if (!cookie) {
      throw new Error("Expected cookie but got undefined.");
    }

    expect(cookie[0]).toEqual(
      "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
    );
  });
});
