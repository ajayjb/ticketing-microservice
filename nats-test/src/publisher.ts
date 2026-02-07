import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticketCreatedPublisher";

console.clear();

const stan = nats.connect("tickets", `publisher-${process.pid}`, {
  url: "http://localhost:4222",
});

stan.on("connect", async () => {
  console.log("Publisher connected to STAN");

  await new TicketCreatedPublisher(stan).publish({
    id: 3,
    name: "concert",
    price: 20,
  });
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
