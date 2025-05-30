import { Response } from "express";

import {
  AccessTokenErrorResponse,
  BadRequestResponse,
  BadTokenResponse,
  ForbiddenResponse,
  InternalErrorResponse,
  NoFoundResponse,
} from "@/core/ApiResponse";
import { sanitizedConfig } from "@/config/config";
import { ENVIRONMENTS } from "@/constants/environments";

export enum ErrorType {
  BAD_TOKEN = "BadTokenError",
  TOKEN_EXPIRED = "TokenExpiredError",
  UNAUTHORIZED = "AuthFailureError",
  ACCESS_TOKEN = "AccessTokenError",
  INTERNAL = "InternalError",
  NOT_FOUND = "NotFoundError",
  NO_ENTRY = "NoEntryError",
  NO_DATA = "NoDataError",
  BAD_REQUEST = "BadRequestError",
  FORBIDDEN = "ForbiddenError",
}

export type ErrorDetailType = {
  field: string | number;
  message?: (string | number)[];
};

export abstract class ApiError extends Error {
  constructor(
    public type: ErrorType,
    public message: string = "Error",
    public errors: ErrorDetailType[]
  ) {
    super(type);
    this.type = type;
    this.message = message;
    this.errors = errors;
  }

  public static handle(err: ApiError, res: Response) {
    switch (err.type) {
      case ErrorType.BAD_TOKEN:
      case ErrorType.TOKEN_EXPIRED:
      case ErrorType.UNAUTHORIZED:
        new BadTokenResponse(err.message, err.errors).send(res);
        break;
      case ErrorType.ACCESS_TOKEN:
        new AccessTokenErrorResponse(err.message, err.errors).send(res);
        break;
      case ErrorType.INTERNAL:
        new InternalErrorResponse(err.message, err.errors).send(res);
        break;
      case ErrorType.NOT_FOUND:
      case ErrorType.NO_ENTRY:
      case ErrorType.NO_DATA:
        new NoFoundResponse(err.message, err.errors).send(res);
        break;
      case ErrorType.BAD_REQUEST:
        new BadRequestResponse(err.message, err.errors).send(res);
        break;
      case ErrorType.FORBIDDEN:
        new ForbiddenResponse(err.message, err.errors).send(res);
        break;
      default:
        let messsage = err.message;

        if (!sanitizedConfig.ENVIRONMENT) {
          throw new Error("Missing required environment variable: ENVIRONMENT");
        }

        messsage =
          sanitizedConfig.ENVIRONMENT !== ENVIRONMENTS.production
            ? messsage
            : "Something went wrong!";
        new InternalErrorResponse(messsage, err.errors).send(res);
        break;
    }
  }
}

export class BadTokenError extends ApiError {
  constructor(
    message: string = "Invalid token",
    errors: ErrorDetailType[] = []
  ) {
    super(ErrorType.BAD_TOKEN, message, errors);
  }
}

export class TokenExpiredError extends ApiError {
  constructor(
    message: string = "Token expired",
    errors: ErrorDetailType[] = []
  ) {
    super(ErrorType.TOKEN_EXPIRED, message, errors);
  }
}

export class AuthFailureError extends ApiError {
  constructor(
    message: string = "Invalid Credentials",
    errors: ErrorDetailType[] = []
  ) {
    super(ErrorType.UNAUTHORIZED, message, errors);
  }
}

export class AccessTokenError extends ApiError {
  constructor(
    message: string = "Invalid access token",
    errors: ErrorDetailType[] = []
  ) {
    super(ErrorType.ACCESS_TOKEN, message, errors);
  }
}
export class InternalError extends ApiError {
  constructor(
    message: string = "Internal error",
    errors: ErrorDetailType[] = []
  ) {
    message =
      sanitizedConfig.ENVIRONMENT !== ENVIRONMENTS.production
        ? message
        : "Something went wrong!";
    super(ErrorType.INTERNAL, message, errors);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Not found", errors: ErrorDetailType[] = []) {
    super(ErrorType.NOT_FOUND, message, errors);
  }
}

export class NoEntryError extends ApiError {
  constructor(
    message: string = "Entry don't exists",
    errors: ErrorDetailType[] = []
  ) {
    super(ErrorType.NO_ENTRY, message, errors);
  }
}

export class NoDataError extends ApiError {
  constructor(message: string = "No data", errors: ErrorDetailType[] = []) {
    super(ErrorType.NO_DATA, message, errors);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = "Bad request", errors: ErrorDetailType[] = []) {
    super(ErrorType.BAD_REQUEST, message, errors);
  }
}

export class ForbiddenError extends ApiError {
  constructor(
    message: string = "Permission denied",
    errors: ErrorDetailType[] = []
  ) {
    super(ErrorType.FORBIDDEN, message, errors);
  }
}
