import { sanitizedConfig } from "@/config/config";
import Stripe from "stripe";

export const stripe = new Stripe(sanitizedConfig.STRIPE_API_KEY, {
  apiVersion: "2026-02-25.clover",
});