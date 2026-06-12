import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

export const PLAN_PRICE_ID = process.env.STRIPE_PRICE_ID!;

export const TRIAL_DAYS = 14;

export function isSubscriptionActive(status: string, trialEndsAt: Date | null): boolean {
  if (status === "active") return true;
  if (status === "trialing" && trialEndsAt && trialEndsAt > new Date()) return true;
  return false;
}
