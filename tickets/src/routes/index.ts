import { Router } from "express";

import TicketsRouter from "./ticket";

const ticketsRouter: Router = new TicketsRouter().router;

export { ticketsRouter };
