import express, { Request, Response, Express, NextFunction } from "express";
import cookieSession from "cookie-session";
import cookieParser from "cookie-parser";
import {
  ApiError,
  ENVIRONMENTS,
  InternalError,
  logger,
  NotFoundError,
  ResponseStatusCode,
  SuccessResponse,
} from "@ajayjbtickets/common";

import { sanitizedConfig } from "@/config/config";

class App {
  public server: Express;
  public apiPrefix: string;

  constructor() {
    this.apiPrefix = `/api`;
    this.server = express();

    this.server.use(cookieParser()); // No need to use this, since cookies sent in req.headers.cookie. To populate req.cookie we can use this.

    this.server.set("trust proxy", 1); // Trust first proxy
    this.server.use(
      cookieSession({
        secure: sanitizedConfig.ENVIRONMENT === ENVIRONMENTS.production,
        httpOnly: true,
        signed: false,
      })
    );
    this.server.use(express.json());

    this.registerRoutes();
    this.server.all("/*", (req: Request, res: Response) => {
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
      const unknownError = new InternalError(message);
      ApiError.handle(unknownError, res);
    }
  }

  async healthCheck(req: Request, res: Response) {
    return new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      "Orders service is alive!",
      null
    ).send(res);
  }

  public init(port: number) {
    this.server.listen(port, () => {
      logger.info(`Orders microservice listening on port ${port}`);
      console.log(`Orders microservice listening on port ${port}`);
    });
  }

  private registerRoutes() {
    this.server.get(`${this.apiPrefix}/health`, this.healthCheck);
  }
}

const app = new App();

export default app;
