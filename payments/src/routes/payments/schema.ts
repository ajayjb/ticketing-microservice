import { objectId } from "@ajayjbtickets/common";
import { z } from "zod";

class PaymentsValidators {
  static create = () => {
    return z.object({
      orderId: objectId,
    });
  };
}

export default PaymentsValidators;
