import { Request, Response, NextFunction } from "express";

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler =
  (execution: AsyncFunction) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await execution(req, res, next);
    } catch (err) {
      next(err);
    }
  };
