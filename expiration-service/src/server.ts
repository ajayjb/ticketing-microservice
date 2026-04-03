import { sanitizedConfig } from "@/config/config";
import { natsWrapper } from "./services/nats.service";
import { OrderCreatedListener } from "./events/listeners/orderCreatedListener";

const startApp = async () => {
  await natsWrapper.connect(
    sanitizedConfig.NATS_CLUSTER_ID,
    sanitizedConfig.NATS_CLIENT_ID,
    sanitizedConfig.NATS_URL,
  );

  new OrderCreatedListener(natsWrapper.client).listen();

  natsWrapper.client.on("close", () => {
    console.log("STAN connection closed");
    process.exit();
  });

  process.on("SIGINT", () => natsWrapper.client.close());
  process.on("SIGTERM", () => natsWrapper.client.close());
};

startApp();
