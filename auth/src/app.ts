import express, { Request, Response } from "express";

import { sanitizedConfig } from "./config.js";
import { userRouter } from "./routes/index.js";

class App {
  public server: express.Express;

  constructor() {
    this.server = express();
    this.server.use(express.json());

    this.server.get("/auth/health", this.healthCheck);
    this.registerRoutes();
  }

  healthCheck(req: Request, res: Response): void {
    res.send({
      message: "Auth is alive!!!",
    });
  }

  public init() {
    this.server.listen(sanitizedConfig.PORT, () => {
      console.log(`Auth microservice listning on port ${sanitizedConfig.PORT}`);
    });
  }

  private registerRoutes() {
    this.server.use(userRouter);
  }
}

const app = new App();
app.init();

