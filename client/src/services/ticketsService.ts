import { AxiosResponse } from "axios";

import { API_ENDPOINT } from "@/constants/apiEndpoint";
import { buildClient } from "@/lib/buildClient";
import { Ticket } from "@/types/ticket";

export class TicketsService {
  static async fetchTickets(): Promise<Ticket[]> {
    try {
      const client = await buildClient();

      const { data } = await client.get<AxiosResponse<Ticket[]>>(
        API_ENDPOINT.TICKETS.FIND_ALL,
        {
          params: {
            currentPage: "1",
            itemsPerPage: "1000",
          },
        }
      );

      return data.data;
    } catch (error: any) {
      console.error(
        "Error fetching tickets:",
        error?.response?.data || error.message
      );
      throw new Error(
        error?.response?.data?.message || "Failed to fetch tickets"
      );
    }
  }

  static async findOne(slug: string): Promise<Ticket> {
    try {
      const client = await buildClient();

      const { data } = await client.get<AxiosResponse<Ticket>>(
        `${API_ENDPOINT.TICKETS.FIND_ONE}?slug=${slug}`
      );

      return data.data;
    } catch (error: any) {
      console.error(
        `Error fetching ticket with slug ${slug}:`,
        error?.response?.data || error.message
      );
      throw new Error(
        error?.response?.data?.message || "Failed to fetch ticket"
      );
    }
  }
}
