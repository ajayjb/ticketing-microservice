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
        console.log("Linstner connected to STAN");
        this._client = client;
        resolve(client);
      });

      client.on("error", (error) => {
        reject(error);
      });
    });
  }
}

const natsWrapper = new NatsWrapper();

export { natsWrapper };
