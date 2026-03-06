import { Router } from "express";
import {
  asyncHandler,
  schemaValidator,
  ValidationSource,
  verifyToken,
} from "@ajayjbtickets/common";
import OrdersController from "@/controllers/orders.controller";
import OrdersValidators from "./schema";

class OrdersRouter {
  public router: Router;
  private ordersController: OrdersController;

  constructor() {
    this.router = Router();
    this.ordersController = new OrdersController();
    this.init();
  }

  private init() {
    this.router.post(
      "/create",
      verifyToken,
      schemaValidator(ValidationSource.BODY, OrdersValidators.create()),
      asyncHandler(this.ordersController.create)
    );

    this.router.get(
      "/findByUser",
      verifyToken,
      asyncHandler(this.ordersController.findByUser)
    );

    this.router.get(
      "/:id",
      verifyToken,
      asyncHandler(this.ordersController.findById)
    );

    this.router.delete(
      "/:id",
      verifyToken,
      asyncHandler(this.ordersController.delete)
    );
  }
}

export default OrdersRouter;
