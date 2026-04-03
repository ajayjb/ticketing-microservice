import { API_ENDPOINT } from "@/constants/apiEndpoint";
import api from "@/lib/axios";

export class PaymentsService {
  static async createPaymentIntent({ orderId }: { orderId: string }) {
    try {
      const { data } = await api.post<{
        data: { clientSecret: string };
      }>(API_ENDPOINT.PAYMENTS.CREATE, {
        orderId,
      });

      return data.data;
    } catch (error: any) {
      console.error(
        "Error creating payment intent:",
        error?.response?.data || error.message,
      );
      throw new Error(
        error?.response?.data?.message || "Failed to create payment intent",
      );
    }
  }
}
