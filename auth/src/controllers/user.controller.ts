import { Request, Response } from "express";

import User from "@/database/models/User.model";
import { ResponseStatusCode, SuccessResponse } from "@/core/ApiResponse";
import { AuthFailureError, BadRequestError } from "@/core/ApiError";
import { MESSAGES } from "@/constants/messages";
import JwtService from "@/services/jwt.service";
import Password from "@/services/password.service";
import { Types } from "mongoose";

class UserController {
  constructor() {}

  async signup(req: Request, res: Response) {
    const { first_name, middle_name, last_name, email, password } = req.body;

    const userExists = await User.findOne({ email: email });

    if (userExists) {
      throw new BadRequestError(MESSAGES.USER.USER_ALREADY_SIGNED_UP);
    }

    const user = await User.build({
      first_name,
      middle_name,
      last_name,
      email,
      password,
    }).save();

    const payload = JwtService.generatePayload(user);
    const token = JwtService.sign(payload);

    req.session = {
      token: token,
    };

    new SuccessResponse(
      ResponseStatusCode.CREATED,
      MESSAGES.USER.USER_SIGNUP_SUCCESS,
      user
    ).send(res);
  }

  async signin(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      throw new AuthFailureError(MESSAGES.USER.USER_NOT_EXISTS);
    }
    if (!(await Password.comparePassword(password, user.password))) {
      throw new AuthFailureError(MESSAGES.USER.INVALID_USER_PASSWORD);
    }

    const payload = JwtService.generatePayload(user);
    const token = JwtService.sign(payload);

    req.session.token = token;

    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.USER.USER_SIGNIN_SUCCESS,
      user
    ).send(res);
  }

  async signout(req: Request, res: Response) {
    res.clearCookie("session", { maxAge: 0 }); // No need for this in session-cookie, used in express-cookie
    req.session = null; // If null cookie-session knows to remove session-cookie in client

    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.USER.USER_SIGN_OUT_SUCCESS,
      null
    ).send(res);
  }

  async currentUser(req: Request, res: Response) {
    new SuccessResponse(
      ResponseStatusCode.SUCCESS,
      MESSAGES.GENERAL.SUCCESS,
      req.user
    ).send(res);
  }
}

export default UserController;
