import express, { Request, Response, Express, NextFunction } from "express";

import { sanitizedConfig } from "./config/config.js";
import { userRouter } from "./routes/index.js";
import { ResponseStatusCode, SuccessResponse } from "./core/ApiResponse.js";
import { ApiError, InternalError, NotFoundError } from "./core/ApiError.js";
import { ENVIRONMENTS } from "./utils/constants.js";
import logger from "./core/Logger.js";

class App {
  public server: Express;

  constructor() {
    this.server = express();
    this.server.use(express.json());

    this.server.get(
      `/auth/api/${sanitizedConfig.VERSION}/health`,
      this.healthCheck
    );
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

  healthCheck(req: Request, res: Response) {
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
    this.server.use(`/auth/api/${sanitizedConfig.VERSION}/user`, userRouter);
  }
}

const app = new App();
app.init();
