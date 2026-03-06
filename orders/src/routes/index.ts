import { Router } from "express";
import OrdersRouter from "./orders";

const ordersRouter: Router = new OrdersRouter().router;

export { ordersRouter };
