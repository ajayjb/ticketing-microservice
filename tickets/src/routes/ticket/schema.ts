import { z } from "zod";

class TicketsValidators {
  static create = () => {
    return z.object({
      name: z.string().min(5).max(50),
      price: z.number().min(0),
    });
  };
  static update = () => {
    return z.object({
      name: z.string().min(5).max(50).optional(),
      price: z.number().min(0).optional(),
    });
  };

  static findAll = () => {
    return z.object({
      currentPage: z
        .string()
        .refine((item) => !isNaN(Number(item)) && Number(item) >= 1, {
          message: "Current page must be a number and greater than 0",
        })
        .optional(),
      itemsPerPage: z
        .string()
        .refine(
          (item) =>
            !isNaN(Number(item)) && Number(item) >= 1 && Number(item) <= 100,
          {
            message: "Items per page name must be a number and greater than 0",
          }
        )
        .optional(),
    });
  };
}

export default TicketsValidators;
