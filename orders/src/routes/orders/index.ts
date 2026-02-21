import { Router } from "express";
import {
  asyncHandler,
  schemaValidator,
  ValidationSource,
  verifyToken,
} from "@ajayjbtickets/common";


class OrdersRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  private init() {

  }
}

export default OrdersRouter;
