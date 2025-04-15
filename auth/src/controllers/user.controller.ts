import { Request, Response } from "express";

import { ResponseStatusCode, SuccessResponse } from "../core/ApiResponse.js";
import User from "../database/models/User.js";
import { BadRequestError } from "../core/ApiError.js";
import { MESSAGES } from "../constants/messages.js";

class UserController {
  constructor() {}

  async signUp(req: Request, res: Response) {
    const { first_name, middle_name, last_name, email, password } = req.body;

    const userExists = await User.findOne({ email: email });

    if (userExists) {
      throw new BadRequestError(MESSAGES.USER.USER_ALREADY_SIGNED_UP);
    }

    await User.build({
      first_name,
      middle_name,
      last_name,
      email,
      password,
    }).save();

    new SuccessResponse(
      ResponseStatusCode.CREATED,
      MESSAGES.USER.USER_SIGNUP_SUCCESS,
      req.body
    ).send(res);
  }

  signIn() {}

  signOut() {}

  currentUser() {}
}

export default UserController;
