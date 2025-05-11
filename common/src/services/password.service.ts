import bcrypt from "bcrypt";

export class Password {
  static hashPassword(password: string, salesRounds: number): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, salesRounds, function (err, hash) {
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

