import { sanitizedConfig } from "@/config/config";
import jsonwebtoken, { SignOptions, VerifyOptions } from "jsonwebtoken";

export interface JwtPayload {
  _id: string;
  email: string;
}

export class JwtService {
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

  static verify(token: string, verifyOptions: VerifyOptions = {}) {
    const decoded = jsonwebtoken.verify(
      token,
      sanitizedConfig.JWT_KEY,
      verifyOptions
    );
    return decoded;
  }

  static generatePayload<T extends JwtPayload>(user: T): T {
    return {
      _id: user._id.toString(),
      email: user.email,
    } as T;
  }
}
