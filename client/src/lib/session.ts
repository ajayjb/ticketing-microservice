import { cookies, headers } from "next/headers";
import { AxiosError } from "axios";

import { User } from "@/types/user";
import { API_ENDPOINT } from "@/constants/apiEndpoint";
import { buildClient } from "./buildClient";
import { Response } from "@/types/response";

export const getSession = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value;
};

export const checkAuth = async (): Promise<User | null> => {
  const incomingHeaders = await headers();
  let user: User | null = null;

  const forwardedHeaders: Record<string, string> = {};
  for (const [key, value] of incomingHeaders.entries()) {
    forwardedHeaders[key] = value;
  }

  try {
    const res = await buildClient<Response<User>>(
      API_ENDPOINT.USER.CURRENT_USER,
      forwardedHeaders
    );
    user = res.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(
        "Authentication error:",
        error.response?.status,
        error.response?.data
      );
    }
  }
  return user;
};
