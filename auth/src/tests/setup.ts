import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

import app from "@/app";
import ROUTES from "@/config/routes";

const server = app.server;
let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

declare global {
  var signin: () => Promise<string[]>; // function signin(): Promise<string[]>;
}

global.signin = async () => {
  await request(server)
    .post(ROUTES.USER.SIGNUP)
    .send({
      first_name: "Ajay J B",
      email: "ajayjb11@gmail.com",
      password: "Admin@123",
    })
    .expect(201);

  const response = await request(server)
    .post(ROUTES.USER.SIGNIN)
    .send({
      email: "ajayjb11@gmail.com",
      password: "Admin@123",
    })
    .expect(200);

  const cookie = response.get("Set-Cookie");

  if (!cookie) {
    throw new Error("Expected cookie but got undefined.");
  }

  return cookie;
};
