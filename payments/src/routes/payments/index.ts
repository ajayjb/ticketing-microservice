import { Router } from "express";
import PaymentsController from "@/controllers/payments.controller";
import {
  ValidationSource,
  asyncHandler,
  schemaValidator,
  verifyToken,
} from "@ajayjbtickets/common";
import PaymentsValidators from "./schema";

class PaymentsRouter {
  public router: Router;
  private paymentsController: PaymentsController;

  constructor() {
    this.router = Router();
    this.paymentsController = new PaymentsController();
    this.init();
  }

  private init() {
    this.router.post(
      "/create",
      verifyToken,
      schemaValidator(ValidationSource.BODY, PaymentsValidators.create()),
      asyncHandler(this.paymentsController.create)
    );

    this.router.post(
      "/webhooks/stripe",
      asyncHandler(this.paymentsController.handleStripeWebhook)
    );
  }
}

export default PaymentsRouter;
