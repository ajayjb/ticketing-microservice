import { Response } from "express";

import {
  AccessTokenErrorResponse,
  BadRequestResponse,
  BadTokenResponse,
  ForbiddenResponse,
  InternalErrorResponse,
  NoFoundResponse,
} from "./ApiResponse.js";
import { sanitizedConfig } from "../config.js";
import { PRODUCTION } from "../utils/localization.js";

enum ErrorType {
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

abstract class ApiError extends Error {
  constructor(public type: ErrorType, public message: string = "Error") {
    super(type);
    this.type = type;
    this.message = message;
  }

  public static handle(err: ApiError, res: Response): Response {
    switch (err.type) {
      case ErrorType.BAD_TOKEN:
      case ErrorType.TOKEN_EXPIRED:
      case ErrorType.UNAUTHORIZED:
        return new BadTokenResponse(err.message).send(res);
      case ErrorType.ACCESS_TOKEN:
        return new AccessTokenErrorResponse(err.message).send(res);
      case ErrorType.INTERNAL:
        return new InternalErrorResponse(err.message).send(res);
      case ErrorType.NOT_FOUND:
      case ErrorType.NO_ENTRY:
      case ErrorType.NO_DATA:
        return new NoFoundResponse(err.message).send(res);
      case ErrorType.BAD_REQUEST:
        return new BadRequestResponse(err.message).send(res);
      case ErrorType.FORBIDDEN:
        return new ForbiddenResponse(err.message).send(res);
      default:
        let messsage = err.message;
        messsage =
          sanitizedConfig.environment === PRODUCTION
            ? "Something went wrong!"
            : messsage;
        return new InternalErrorResponse(messsage).send(res);
    }
  }
}

export class BadTokenError extends ApiError {
  constructor(message: string = "Invalid token") {
    super(ErrorType.BAD_TOKEN, message);
  }
}

export class TokenExpiredError extends ApiError {
  constructor(message: string = "Token expired") {
    super(ErrorType.TOKEN_EXPIRED, message);
  }
}

export class AuthFailureError extends ApiError {
  constructor(message: string = "Invalid Credentials") {
    super(ErrorType.UNAUTHORIZED, message);
  }
}

export class AccessTokenError extends ApiError {
  constructor(message: string = "Invalid access token") {
    super(ErrorType.ACCESS_TOKEN, message);
  }
}
export class InternalError extends ApiError {
  constructor(message: string = "Internal error") {
    super(ErrorType.INTERNAL, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Not found") {
    super(ErrorType.NOT_FOUND, message);
  }
}

export class NoEntryError extends ApiError {
  constructor(message: string = "Entry don't exists") {
    super(ErrorType.NO_ENTRY, message);
  }
}

export class NoDataError extends ApiError {
  constructor(message: string = "No data") {
    super(ErrorType.NO_DATA, message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = "Bad request") {
    super(ErrorType.BAD_REQUEST, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Permission denied") {
    super(ErrorType.FORBIDDEN, message);
  }
}
