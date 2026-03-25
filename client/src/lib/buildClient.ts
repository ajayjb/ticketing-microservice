import axios, { AxiosInstance } from "axios";
import { headers } from "next/headers";
import { INGRESS_NGINX_CONTROLLER_SVC_URL } from "@/constants/apiEndpoint";

export const buildClient = async (): Promise<AxiosInstance> => {
  const incomingHeaders = await headers();

  const forwardedHeaders: Record<string, string> = {};
  for (const [key, value] of incomingHeaders.entries()) {
    forwardedHeaders[key] = value;
  }

  const client = axios.create({
    baseURL: INGRESS_NGINX_CONTROLLER_SVC_URL,
    headers: { ...forwardedHeaders, host: "tickets.com" },
  });

  return client;
};
