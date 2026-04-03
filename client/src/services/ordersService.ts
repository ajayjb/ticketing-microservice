import { API_ENDPOINT } from "@/constants/apiEndpoint";
import { buildClient } from "@/lib/buildClient";
import { Order } from "@/types/order";

export class OrdersService {
  static async fetchUserOrders(): Promise<Order[]> {
    try {
      const client = await buildClient();

      const { data } = await client.get<{ data: Order[] }>(
        API_ENDPOINT.ORDERS.FIND_BY_USER,
      );

      return data.data;
    } catch (error: any) {
      console.error(
        "Error fetching user orders:",
        error?.response?.data || error.message,
      );
      throw new Error(
        error?.response?.data?.message || "Failed to fetch user orders",
      );
    }
  }

  static async findById(id: string): Promise<Order> {
    try {
      const client = await buildClient();

      const { data } = await client.get<{ data: Order }>(
        `${API_ENDPOINT.ORDERS.FIND_BY_ID}/${id}`,
      );

      return data.data;
    } catch (error: any) {
      console.error(
        `Error fetching order with id ${id}:`,
        error?.response?.data || error.message,
      );
      throw new Error(
        error?.response?.data?.message || "Failed to fetch order",
      );
    }
  }
}
