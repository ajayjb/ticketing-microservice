import jsonwebtoken from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { BadTokenError, TokenExpiredError } from "@/core/ApiError";
import JwtService, { JwtPayload } from "@/services/jwt.service";

 const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req?.session;
    if (!token) {
      next(new BadTokenError("Authentication token is missing"));
    }

    const decoded = JwtService.verify(token) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jsonwebtoken.TokenExpiredError) {
      next(new TokenExpiredError());
    } else if (error instanceof jsonwebtoken.JsonWebTokenError) {
      next(new BadTokenError());
    } else {
      next(new BadTokenError());
    }
  }
};

export default verifyToken;