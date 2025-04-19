import { Router } from "express";

import UserRouter from "@/routes/user/index.js";

const userRouter: Router = new UserRouter().router;

export { userRouter };
