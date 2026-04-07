import { sanitizedConfig } from "@/config/config";

export const getHostName = () => {
  return new URL(sanitizedConfig.NEXT_PUBLIC_DOMAIN).hostname;
};
