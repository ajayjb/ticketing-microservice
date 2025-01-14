import express from "express";
import { sanitizedConfig } from "./config.js";

const app = express();
app.use(express.json());

app.get("/auth/health", (req, res) => {
  return res.send({
    message: "Auth is alive!!!",
  });
});

app.listen(sanitizedConfig.PORT, () => {
  console.log(
    `Auth microservice listning on port ${sanitizedConfig.PORT}`
  );
});
