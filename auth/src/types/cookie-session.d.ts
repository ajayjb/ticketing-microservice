import { Session } from "cookie-session";

declare global {
  namespace Express {
    interface Request {
      session: Session & { token: string };
    }
  }
}

export {};
