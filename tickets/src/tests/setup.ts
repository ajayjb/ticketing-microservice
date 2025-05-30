import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Types } from "mongoose";

import {  JwtService } from "@ajayjbtickets/common";

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
  var signin: () => string[]; // or function signin(): string[];
}

global.signin = () => {
  const payload = JwtService.generatePayload({
    id: new Types.ObjectId().toString(),
    email: "ajayjb11@gmail.com",
  });

  const token = JwtService.sign(payload);
  const base64 = btoa(JSON.stringify({ token }));

  return [`session=${base64}; path=/; httponly`]; // In supertest all cookies sent from backend will be in a array;
};
