import { Router } from "express";

import UserRouter from "@/routes/user/index";

const userRouter: Router = new UserRouter().router;

export { userRouter };
