import express, { Request, Response, Express, NextFunction } from "express";

import { sanitizedConfig } from "./config/config.js";
import { userRouter } from "./routes/index.js";
import { ResponseStatusCode, SuccessResponse } from "./core/ApiResponse.js";
import { ApiError, InternalError, NotFoundError } from "./core/ApiError.js";
import logger from "./core/Logger.js";
import "./database/index.js";
import { ENVIRONMENTS } from "./constants/environments.js";
import User from "./database/models/User.js";

class App {
  public server: Express;
  public apiPrefix: string;

  constructor() {
    this.apiPrefix = `/auth/api/${sanitizedConfig.VERSION}`;
    this.server = express();
    this.server.use(express.json());

    this.registerRoutes();

    this.server.use((req: Request, res: Response) => {
      throw new NotFoundError("Not found", []);
    });
    this.server.use(this.errorHandler);
  }

  errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof ApiError) {
      ApiError.handle(err, res);
    } else {
      const message =
        sanitizedConfig.ENVIRONMENT !== ENVIRONMENTS.production
          ? err.message
          : "Something went wrong!";
      const unknownError = new InternalError(message, []);
      ApiError.handle(unknownError, res);
    }
  }

  async healthCheck(req: Request, res: Response) {
    return new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      "Auth is alive!",
      null
    ).send(res);
  }

  public init() {
    this.server.listen(sanitizedConfig.PORT, () => {
      logger.info(
        `Auth microservice listening on port ${sanitizedConfig.PORT}`
      );
      console.log(
        `Auth microservice listening on port ${sanitizedConfig.PORT}`
      );
    });
  }

  private registerRoutes() {
    this.server.get(`${this.apiPrefix}/health`, this.healthCheck);
    this.server.use(`${this.apiPrefix}/user`, userRouter);
  }
}

const app = new App();
app.init();
