// lib/stripe.js
// Stripe configuration and helpers

import Stripe from "stripe";

let _stripe = null;

export function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

// Price IDs — set these in .env.local after creating products in Stripe dashboard
export const PLAN_PRICES = {
  starter: process.env.STRIPE_PRICE_STARTER || "",
  growth: process.env.STRIPE_PRICE_GROWTH || "",
  pro: process.env.STRIPE_PRICE_PRO || "",
};

export const PLAN_NAMES = {
  starter: "Starter",
  growth: "Growth",
  pro: "Pro",
};
