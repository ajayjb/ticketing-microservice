import { Router } from "express";
import {
  asyncHandler,
  schemaValidator,
  ValidationSource,
  verifyToken,
} from "@ajayjbtickets/common";

import UserController from "@/controllers/user.controller";
import UserValidators from "@/routes/user/schema";

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
      "/signup",
      schemaValidator(ValidationSource.BODY, UserValidators.signup()),
      asyncHandler(this.userController.signup)
    );
    this.router.post(
      "/signin",
      schemaValidator(ValidationSource.BODY, UserValidators.signin()),
      asyncHandler(this.userController.signin)
    );
    this.router.post("/signout", asyncHandler(this.userController.signout));
    this.router.get(
      "/currentUser",
      verifyToken,
      asyncHandler(this.userController.currentUser)
    );
  }
}

export default UserRouter;
