import { Router } from "express";
import PaymentsRouter from "./payments";

const paymentsRouter: Router = new PaymentsRouter().router;

export { paymentsRouter };