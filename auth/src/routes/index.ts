import express from "express";

import UserRouter from "./user/index.js";

const userRouter: express.Router = new UserRouter().router;

export { userRouter };
