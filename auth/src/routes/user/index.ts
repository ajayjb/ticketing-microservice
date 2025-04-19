import { Router } from "express";

import UserController from "@/controllers/user.controller.js";
import { schemaValidator } from "@/middlewares/schemaValidator.js";
import asyncHandler from "@/utils/asyncHandler.js";
import UserValidators from "@/routes/user/schema.js";
import { ValidationSource } from "@/utils/validators.js";
import { verifyToken } from "@/middlewares/verifyToken.js";

class UserRouter {
  public router: Router;
  public userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = new UserController();

    this.init();
  }

  private init() {
    this.router.post(
      "/signUp",
      schemaValidator(ValidationSource.BODY, UserValidators.signUp()),
      asyncHandler(this.userController.signUp)
    );
    this.router.post(
      "/signIn",
      schemaValidator(ValidationSource.BODY, UserValidators.signIn()),
      asyncHandler(this.userController.signIn)
    );
    this.router.post("/signOut", asyncHandler(this.userController.signOut));
    this.router.get(
      "/currentUser",
      verifyToken,
      asyncHandler(this.userController.currentUser)
    );
  }
}

export default UserRouter;
