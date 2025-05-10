import { Session } from "cookie-session";
import { JwtPayload } from "@/services/jwt.service";
declare global {
  namespace Express {
    interface Request {
      session: Session & { token: string };
      user?: JwtPayload;
    }
  }
}

export {};
