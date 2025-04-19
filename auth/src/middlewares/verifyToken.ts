import jsonwebtoken from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import {
  AccessTokenError,
  BadTokenError,
  TokenExpiredError,
} from "@/core/ApiError.js";
import User from "@/database/models/User.model.js";
import JwtService from "@/services/jwt.service.js";
import { JwtPayload } from "@/types/user.js";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.session;
    if (!token) {
      next(new BadTokenError());
    }

    const decoded = JwtService.verify(token) as JwtPayload;

    const user = await User.findById(decoded._id);
    if (!user) {
      next(new AccessTokenError());
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jsonwebtoken.TokenExpiredError) {
      next(new TokenExpiredError());
    } else if (error instanceof jsonwebtoken.JsonWebTokenError) {
      next(new AccessTokenError());
    } else {
      next(new AccessTokenError());
    }
  }
};
