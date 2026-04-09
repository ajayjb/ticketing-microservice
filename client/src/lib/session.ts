import { AxiosError } from "axios";

import { User } from "@/types/user";
import { API_ENDPOINT } from "@/constants/apiEndpoint";
import { buildClient } from "@/lib/buildClient";
import { ResponseStatusCode } from "@/constants/responseStatusCodes";

export const checkAuth = async (): Promise<User | null> => {
  let user: User | null = null;

  try {
    const client = await buildClient();

    const res = await client.get<{ data: User }>(
      API_ENDPOINT.USER.CURRENT_USER
    );

    user = res.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status as number;
      if ([ResponseStatusCode.UNAUTHORIZED].includes(status)) {
        console.log(
          "Authentication error:",
          error.response?.status,
          error.response?.data
        );
      } else {
        console.log("Error", error.response?.status, error.response?.data);
      }
    } else {
      console.log("Error", error);
    }
  }
  return user;
};
