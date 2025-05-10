import { JwtPayload } from "@/services/jwt.service";
import { Session } from "cookie-session";

declare global {
  namespace Express {
    interface Request {
      session: Session & { token: string };
      user?: JwtPayload;
    }
  }
}

export {};
