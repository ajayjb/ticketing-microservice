import nats from "node-nats-streaming";
import { TicketCreatedListener } from "./events/ticketCreatedListner";

console.clear();

const stan = nats.connect("tickets", `listener-${process.pid}`, {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Linstner connected to STAN");

  new TicketCreatedListener(stan).listen();
});

stan.on("error", (err) => {
  console.error("STAN error:", err);
});

stan.on("close", () => {
  console.log("STAN connection closed");
  process.exit();
});

process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
