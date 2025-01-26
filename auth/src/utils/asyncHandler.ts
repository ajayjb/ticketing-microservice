import { Request, Response, NextFunction } from "express";

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const asyncHandler =
  (execution: AsyncFunction) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await execution(req, res, next);
    } catch (err) {
      return next(err);
    }
  };

export default asyncHandler;
