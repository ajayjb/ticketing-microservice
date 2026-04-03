import "@/database/index";
import { sanitizedConfig } from "@/config/config";
import app from "@/app";
import { natsWrapper } from "./services/nats.service";
import { TicketCreatedListener } from "./events/listeners/ticketCreatedListener";
import { TicketUpdatedListner } from "./events/listeners/ticketUpdatedListener";
import { OrderExpirationCompleteListener } from "./events/listeners/orderExpirationCompleteListener";
import { PaymentCapturedListener } from "./events/listeners/paymentCapturedListener";

const startApp = async () => {
  await natsWrapper.connect(
    sanitizedConfig.NATS_CLUSTER_ID,
    sanitizedConfig.NATS_CLIENT_ID,
    sanitizedConfig.NATS_URL
  );

  new TicketCreatedListener(natsWrapper.client).listen();
  new TicketUpdatedListner(natsWrapper.client).listen();
  new OrderExpirationCompleteListener(natsWrapper.client).listen();
  new PaymentCapturedListener(natsWrapper.client).listen();

  natsWrapper.client.on("close", () => {
    console.log("STAN connection closed");
    process.exit();
  });

  process.on("SIGINT", () => natsWrapper.client.close());
  process.on("SIGTERM", () => natsWrapper.client.close());

  app.init(sanitizedConfig.PORT);
};

startApp();
