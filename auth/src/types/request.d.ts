import { Session } from "cookie-session";
import { UserDocType } from "@/database/models/User.model";

declare global {
  namespace Express {
    interface Request {
      session: Session & { token: string };
      user?: UserDocType | null;
    }
  }
}

export {};
