import nats from "node-nats-streaming";

console.clear();

const stan = nats.connect("tickets", `publisher-${process.pid}`, {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Publisher connected to STAN");

  for (let i = 0; i < 100; i++) {
    stan.publish(
      "ticket:created",
      JSON.stringify({
        id: 1,
        title: "concert",
        price: 20,
      }),
      () => {
        console.log("Ticket published");
      }
    );
  }
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
