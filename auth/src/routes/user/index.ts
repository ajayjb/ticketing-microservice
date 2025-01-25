import express from "express";
import UserController from "../../controllers/user.controller.js";

class UserRouter {
  public router: express.Router;
  public userController: UserController;

  constructor() {
    this.router = express.Router();
    this.userController = new UserController();

    this.init();
  }

  private init() {
    this.router.get("/user/signUp", this.userController.signUp);
    this.router.get("/user/signIn", this.userController.signUp);
    this.router.get("/user/signOut", this.userController.signUp);
    this.router.get("/user/currentUser", this.userController.currentUser);
  }
}

export default UserRouter;
