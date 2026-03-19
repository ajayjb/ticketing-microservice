import { Router } from "express";
import PaymentsController from "@/controllers/payments.controller";

class PaymentsRouter {
  public router: Router;
  private paymentsController: PaymentsController;

  constructor() {
    this.router = Router();
    this.paymentsController = new PaymentsController();
    this.init();
  }

  private init() {}
}

export default PaymentsRouter;
