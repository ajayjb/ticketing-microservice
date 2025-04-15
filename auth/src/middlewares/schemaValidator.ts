import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

import { BadRequestError } from "../core/ApiError.js";
import { ValidationSource } from "../utils/validators.js";

export const schemaValidator = (type: ValidationSource, schema: ZodSchema) => {
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
