import express, { Request, Response, Express } from "express";

import { sanitizedConfig } from "./config.js";
import { userRouter } from "./routes/index.js";
import { ResponseStatusCode } from "./core/ApiResponse.js";

class App {
  public server: Express;

  constructor() {
    this.server = express();

    this.server.use(express.json());

    this.server.get("/auth/health", this.healthCheck);
    this.registerRoutes();
  }

  errorHandler(err: Error, req: Request, res: Response) {}

  healthCheck(req: Request, res: Response): void {
    res.status(ResponseStatusCode.SUCCESS).json({
      message: "Auth is alive!",
    });
  }

  public init() {
    this.server.listen(sanitizedConfig.PORT, () => {
      console.log(
        `Auth microservice listening on port ${sanitizedConfig.PORT}`
      );
    });
  }

  private registerRoutes() {
    this.server.use(userRouter);
  }
}

const app = new App();
app.init();
