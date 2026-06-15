import Stripe from "stripe";
import { getEnv } from "./db";

/**
 * Stripe client configured for the Cloudflare Workers runtime — uses the
 * fetch-based HTTP client instead of Node's http module. Throws if the secret
 * key isn't configured (billing not set up yet).
 */
export async function getStripe(): Promise<Stripe> {
  const env = await getEnv();
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  return new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });
}
