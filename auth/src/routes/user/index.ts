import { Router } from "express";
import UserController from "../../controllers/user.controller.js";

class UserRouter {
  public router: Router;
  public userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = new UserController();

    this.init();
  }

  private init() {
    this.router.get("/user/signUp", this.userController.signUp);
    this.router.get("/user/signIn", this.userController.signIn);
    this.router.get("/user/signOut", this.userController.signOut);
    this.router.get("/user/currentUser", this.userController.currentUser);
  }
}

export default UserRouter;
