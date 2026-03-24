import { randomUUID } from "crypto";

export const stripe = {
  paymentIntents: {
    create: jest.fn().mockImplementation(async (attr: any) => {
      return Promise.resolve({
        id: randomUUID(),
        client_secret: randomUUID(),
      });
    }),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
};
