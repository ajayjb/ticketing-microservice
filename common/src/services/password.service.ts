import { sanitizedConfig } from "@/config/config";
import bcrypt from "bcrypt";

export class Password {
  static hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!sanitizedConfig.SALT_ROUNDS) {
        reject("Missing required environment variable: SALT_ROUNDS");
      }

      bcrypt.hash(password, sanitizedConfig.SALT_ROUNDS, function (err, hash) {
        if (err) {
          reject(err.message);
        }
        resolve(hash);
      });
    });
  }

  static comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<string | boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hashedPassword, function (err, result) {
        if (err) {
          reject(err.message);
        }
        resolve(result);
      });
    });
  }
}
