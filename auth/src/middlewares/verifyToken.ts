import jsonwebtoken from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { BadTokenError, TokenExpiredError } from "@/core/ApiError";
import User from "@/database/models/User.model";
import JwtService from "@/services/jwt.service";
import { JwtPayload } from "@/types/user";

export const verifyToken = async (
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

    const user = await User.findById(decoded._id).lean();
    
    if (!user) {
      next(new BadTokenError());
    }

    req.user = user;
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
