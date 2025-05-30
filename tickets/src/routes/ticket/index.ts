import { Router } from "express";
import {
  asyncHandler,
  schemaValidator,
  ValidationSource,
  verifyToken,
} from "@ajayjbtickets/common";

import TicketsController from "@/controllers/tickets.controller";
import TicketsValidators from "@/routes/ticket/schema";

class TicketsRouter {
  public router: Router;
  public ticketController: TicketsController;

  constructor() {
    this.router = Router();
    this.ticketController = new TicketsController();
    this.init();
  }

  private init() {
    this.router.post(
      "/create",
      verifyToken,
      schemaValidator(ValidationSource.BODY, TicketsValidators.create()),
      asyncHandler(this.ticketController.create)
    );
    this.router.put(
      "/update/:id",
      verifyToken,
      schemaValidator(ValidationSource.BODY, TicketsValidators.update()),
      asyncHandler(this.ticketController.update)
    );
    this.router.get(
      "/findAll",
      verifyToken,
      schemaValidator(ValidationSource.QUERY, TicketsValidators.findAll()),
      asyncHandler(this.ticketController.findAll)
    );
    this.router.get(
      "/findById/:id",
      verifyToken,
      asyncHandler(this.ticketController.findById)
    );
    this.router.delete(
      "/remove/:id",
      verifyToken,
      asyncHandler(this.ticketController.remove)
    );
  }
}

export default TicketsRouter;
