import nats, { Message } from "node-nats-streaming";

console.clear();

const stan = nats.connect("tickets", `listener-${process.pid}`, {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Linstner connected to STAN");

  const options = stan
    .subscriptionOptions()
    .setManualAckMode(true)
    .setDeliverAllAvailable()
    .setDurableName("orders-service-ticket-created");

  const subscription = stan.subscribe(
    "ticket:created",
    "orders-service-queue-group",
    options
  );

  subscription.on("message", (msg: Message) => {
    console.log(msg.getSubject(), msg.getSequence(), msg.getData());

    msg.ack();
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
