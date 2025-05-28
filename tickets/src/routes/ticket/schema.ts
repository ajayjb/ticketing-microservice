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
      name: z.string().min(5).max(50),
      price: z.number().min(0),
    });
  };
}

export default TicketsValidators;
