import { Stan } from "node-nats-streaming";

import { Event } from "@/common/interfaces/event";

export abstract class Publisher<T extends Event> {
  abstract subject: T["subject"];
  private client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  async publish(data: T["data"]): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (error, guid) => {
        if (error) {
          reject(error);
        }
        resolve(guid);
      });
    });
  }
}
