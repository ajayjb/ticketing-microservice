import axios, { AxiosResponse } from "axios";
import { INGRESS_NGINX_CONTROLLER_SVC_URL } from "@/constants/apiEndpoint";

export const buildClient = async <T>(
  path: string,
  headers: Record<string, string>
): Promise<AxiosResponse<T>> => {
  const res = await axios.get(`${INGRESS_NGINX_CONTROLLER_SVC_URL}${path}`, {
    headers: { ...headers, host: "tickets.com" },
  });
  return res;
};
