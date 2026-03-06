import { objectId } from "@ajayjbtickets/common";
import { z } from "zod";

class OrdersValidators {
  static create = () => {
    return z.object({
      ticketId: objectId
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

export default OrdersValidators;
