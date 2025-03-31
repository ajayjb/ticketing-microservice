import { z } from "zod";

class UserValidators {
  signUp() {
    return z.object({
      first_name: z.string().min(5).max(30),
      middle_name: z.string().min(5).max(30).optional(),
      last_name: z.string().min(5).max(30).optional(),
      email: z.string().email(),
      password: z
        .string()
        .min(8)
        .max(20)
        .refine((password) => /[A-Z]/.test(password), {
          message: "Password must contain at least one uppercase letter",
        })
        .refine((password) => /[a-z]/.test(password), {
          message: "Password must contain at least one lowercase letter",
        })
        .refine((password) => /[0-9]/.test(password), {
          message: "Password must contain at least one digit",
        })
        .refine((password) => /[!@#$%^&*]/.test(password), {
          message:
            "Password must contain at least one special character (!@#$%^&*)",
        }),
    });
  }
  signIn() {
    return z.object({
      email: z.string().email(),
      password: z.string(),
    });
  }
  signOut() {
    return z.object({
      email: z.string().email(),
    });
  }
}

export default UserValidators;
