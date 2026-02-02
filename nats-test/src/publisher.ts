import nats from "node-nats-streaming";

const stan = nats.connect("tickets", `publisher-${process.pid}`, {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Publisher connected to STAN");
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
