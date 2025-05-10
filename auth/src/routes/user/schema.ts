import { z } from "zod";

class UserValidators {
  static signup() {
    return z.object({
      firstName: z
        .string()
        .min(4)
        .max(30)
        .refine((password) => !/\d+/.test(password), {
          message: "First name must contain letters only",
        }),
      middleName: z.string().max(30).optional().or(z.literal("")),
      lastName: z.string().max(30).optional().or(z.literal("")),
      email: z.string().email(),
      password: z
        .string()
        .min(8)
        .max(20)
        .refine((password) => /[A-Z]/.test(password), {
          message: "Must contain at least one uppercase letter",
        })
        .refine((password) => /[a-z]/.test(password), {
          message: "Must contain at least one lowercase letter",
        })
        .refine((password) => /[0-9]/.test(password), {
          message: "Must contain at least one digit",
        })
        .refine((password) => /[!@#$%^&*]/.test(password), {
          message:
            "Must contain at least one special character (!@#$%^&*)",
        }),
    });
  }
  static signin() {
    return z.object({
      email: z.string().email(),
      password: z.string(),
    });
  }
}

export default UserValidators;
