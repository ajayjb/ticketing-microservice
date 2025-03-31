import { Router } from "express";

import UserController from "../../controllers/user.controller.js";
import { schemaValidator } from "../../middlewares/schemaValidator.js";
import { BODY } from "../../utils/constants.js";
import { userValidators } from "../../validators/index.js";
import asyncHandler from "../../utils/asyncHandler.js";

class UserRouter {
  public router: Router;
  public userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = new UserController();

    this.init();
  }

  private init() {
    this.router.get(
      "/signUp",
      schemaValidator(BODY, userValidators.signUp()),
      asyncHandler(this.userController.signUp)
    );
    this.router.get("/signIn", this.userController.signIn);
    this.router.get("/signOut", this.userController.signOut);
    this.router.get("/currentUser", this.userController.currentUser);
  }
}

export default UserRouter;
