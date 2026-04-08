import axios, { AxiosInstance } from "axios";
import { headers } from "next/headers";
import { INGRESS_NGINX_CONTROLLER_SVC_URL } from "@/constants/apiEndpoint";
import { getHostName } from "@/utils/getHostName";

export const buildClient = async (
  otherHeaders?: Record<string, string>
): Promise<AxiosInstance> => {
  const incomingHeaders = await headers();

  if (!otherHeaders) {
    otherHeaders = {};
  }

  const forwardedHeaders: Record<string, string> = {};
  for (const [key, value] of incomingHeaders.entries()) {
    forwardedHeaders[key] = value;
  }

  const client = axios.create({
    baseURL: INGRESS_NGINX_CONTROLLER_SVC_URL,
    headers: { ...forwardedHeaders, ...otherHeaders, host: getHostName() },
  });

  return client;
};
