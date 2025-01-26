import { Response } from "express";

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
  ): Response {
    for (const [key, value] of Object.entries(headers)) {
      res.append(key, value);
    }
    return res.status(this.status).json(this.sanitize(response));
  }

  public send(
    res: Response,
    headers: { [key: string]: string } = {}
  ): Response {
    return this.prepare<ApiResponse>(res, this, headers);
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
    protected data: T
  ) {
    super(responseStatusCode, message, StatusCode.SUCCESS);
    this.data = data;
  }

  send(res: Response): Response {
    return this.prepare<SuccessResponse<T>>(res, this, {});
  }
}

export class AccessTokenErrorResponse extends ApiResponse {
  private instruction: string = "refresh_token";

  constructor(message: string) {
    super(
      ResponseStatusCode.UNAUTHORIZED,
      message,
      StatusCode.IN_VALID_ACCESS_TOKEN
    );
  }

  send(res: Response, headers: { [key: string]: string } = {}): Response {
    headers.instruction = this.instruction;
    return this.prepare<AccessTokenErrorResponse>(res, this, {});
  }
}

export class BadTokenResponse extends ApiResponse {
  constructor(message: string) {
    super(ResponseStatusCode.UNAUTHORIZED, message, StatusCode.FAILURE);
  }
}

export class BadRequestResponse extends ApiResponse {
  constructor(message: string) {
    super(ResponseStatusCode.BAD_REQUEST, message, StatusCode.FAILURE);
  }
}

export class InternalErrorResponse extends ApiResponse {
  constructor(message: string) {
    super(ResponseStatusCode.INTERNAL_ERROR, message, StatusCode.FAILURE);
  }
}

export class NoFoundResponse extends ApiResponse {
  constructor(message: string) {
    super(ResponseStatusCode.NOT_FOUND, message, StatusCode.FAILURE);
  }
}

export class ForbiddenResponse extends ApiResponse {
  constructor(message: string) {
    super(ResponseStatusCode.FORBIDDEN, message, StatusCode.FAILURE);
  }
}
