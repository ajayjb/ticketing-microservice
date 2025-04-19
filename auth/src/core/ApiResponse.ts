import { Response } from "express";
import { ErrorDetailType } from "@/core/ApiError.js";

export enum StatusCode {
  SUCCESS = "10000",
  FAILURE = "10001",
  RETRY = "10002",
  IN_VALID_ACCESS_TOKEN = "10003",
}

export enum ResponseStatusCode {
  SUCCESS = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,

  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  CONFLICT = 409,
  GONE = 410,
  PAYLOAD_TOO_LARGE = 413,
  UNSUPPORTED_MEDIA_TYPE = 415,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  INTERNAL_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

export abstract class ApiResponse {
  public message: string;
  public statusCode: string | undefined;
  public status: number;

  constructor(status: number, message: string, statusCode?: string) {
    this.message = message;
    this.status = status;
    if (statusCode) {
      this.statusCode = statusCode;
    }
  }

  public prepare<T extends ApiResponse>(
    res: Response,
    response: T,
    headers: { [key: string]: string } = {}
  ) {
    for (const [key, value] of Object.entries(headers)) {
      res.append(key, value);
    }
    res.status(this.status).send(this.sanitize(response));
  }

  public send(res: Response, headers: { [key: string]: string } = {}) {
    this.prepare<ApiResponse>(res, this, headers);
  }

  private sanitize<T extends ApiResponse>(response: T) {
    const clone = {} as T;
    Object.assign(clone, response);

    delete clone["statusCode"];

    for (const key in clone) {
      const typedKey = key as keyof T;
      if (clone[typedKey] === undefined) {
        delete clone[typedKey];
      }
    }
    return clone;
  }
}

export class SuccessResponse<T> extends ApiResponse {
  constructor(
    responseStatusCode:
      | ResponseStatusCode.SUCCESS
      | ResponseStatusCode.CREATED
      | ResponseStatusCode.ACCEPTED
      | ResponseStatusCode.NO_CONTENT,
    message: string,
    public data: T
  ) {
    super(responseStatusCode, message, StatusCode.SUCCESS);
    this.data = data;
  }

  send(res: Response) {
    this.prepare<SuccessResponse<T>>(res, this, {});
  }
}

export class AccessTokenErrorResponse extends ApiResponse {
  protected instruction: string = "refresh_token";
  public errors: ErrorDetailType[];

  constructor(message: string, errors: ErrorDetailType[]) {
    super(
      ResponseStatusCode.UNAUTHORIZED,
      message,
      StatusCode.IN_VALID_ACCESS_TOKEN
    );
    this.errors = errors || [];
  }

  send(res: Response, headers: { [key: string]: string } = {}) {
    headers.instruction = this.instruction;
    this.prepare<AccessTokenErrorResponse>(res, this, headers);
  }
}

export class BadTokenResponse extends ApiResponse {
  public errors: ErrorDetailType[];

  constructor(message: string, errors: ErrorDetailType[]) {
    super(ResponseStatusCode.UNAUTHORIZED, message, StatusCode.FAILURE);
    this.errors = errors || [];
  }
}

export class BadRequestResponse extends ApiResponse {
  public errors: ErrorDetailType[];

  constructor(message: string, errors: ErrorDetailType[]) {
    super(ResponseStatusCode.BAD_REQUEST, message, StatusCode.FAILURE);
    this.errors = errors || [];
  }
}

export class InternalErrorResponse extends ApiResponse {
  public errors: ErrorDetailType[];

  constructor(message: string, errors: ErrorDetailType[]) {
    super(ResponseStatusCode.INTERNAL_ERROR, message, StatusCode.FAILURE);
    this.errors = errors || [];
  }
}

export class NoFoundResponse extends ApiResponse {
  public errors: ErrorDetailType[];

  constructor(message: string, errors: ErrorDetailType[]) {
    super(ResponseStatusCode.NOT_FOUND, message, StatusCode.FAILURE);
    this.errors = errors || [];
  }
}

export class ForbiddenResponse extends ApiResponse {
  public errors: ErrorDetailType[];

  constructor(message: string, errors: ErrorDetailType[]) {
    super(ResponseStatusCode.FORBIDDEN, message, StatusCode.FAILURE);
    this.errors = errors || [];
  }
}
