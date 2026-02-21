import { logger } from "@ajayjbtickets/common";
import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error("Cannot access NATS client before connecting");
    }

    return this._client;
  }

  connect(clusterID: string, clientID: string, url: string): Promise<Stan> {
    return new Promise((resolve, reject) => {
      if (this._client) resolve(this._client);

      const client = nats.connect(clusterID, clientID, {
        url,
      });

      client.on("connect", () => {
        logger.info("Stan connection done");
        this._client = client;
        resolve(client);
      });

      client.on("error", (error) => {
        reject(error);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();