import jsonwebtoken, { SignOptions } from "jsonwebtoken";

import { sanitizedConfig } from "@/config/config";
import { UserDocType } from "@/database/models/User.model";
import { JwtPayload } from "@/types/user";

class JwtService {
  static sign(
    payload: string | Buffer | object,
    signOptions: SignOptions = {}
  ): string {
    const token = jsonwebtoken.sign(
      payload,
      sanitizedConfig.JWT_KEY,
      signOptions
    );
    return token;
  }

  static verify(token: string) {
    const decoded = jsonwebtoken.verify(token, sanitizedConfig.JWT_KEY);
    return decoded;
  }

  static generatePayload(user: UserDocType): JwtPayload {
    return {
      _id: user._id.toString(),
      email: user.email,
    };
  }
}

export default JwtService;
