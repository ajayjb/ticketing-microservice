import { Request, Response, NextFunction } from "express";
import { ResponseStatusCode, SuccessResponse } from "../core/ApiResponse.js";

class UserController {
  constructor() {}

  async signUp(req: Request, res: Response) {
    new SuccessResponse(
      ResponseStatusCode.CREATED,
      "User created successfully!",
      req.body
    ).send(res);
  }

  signIn() {}

  signOut() {}

  currentUser() {}
}

export default UserController;
