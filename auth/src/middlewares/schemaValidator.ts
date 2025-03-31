import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { BadRequestResponse } from "../core/ApiResponse.js";
import { BadRequestError, ErrorDetailType } from "../core/ApiError.js";

export type BODY = "body";
export type QUERY = "query";

export const schemaValidator = (type: BODY | QUERY, schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[type]);

    if (!result.success) {
      const errors = Object.entries(result.error.flatten().fieldErrors).map(
        ([key, value]) => ({
          field: key,
          message: value,
        })
      );
      next(new BadRequestError("Bad request", errors));
    } else {
      next();
    }
  };
};
