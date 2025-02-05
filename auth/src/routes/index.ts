import { Router } from "express";

import UserRouter from "./user/index.js";

const userRouter: Router = new UserRouter().router;

export { userRouter };
