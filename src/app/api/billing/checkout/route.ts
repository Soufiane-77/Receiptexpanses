import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";
import { getStripe } from "@/lib/server/stripe";
import { getEnv } from "@/lib/server/db";
import { getCustomerId, setCustomerId } from "@/lib/server/subscriptions";

export const dynamic = "force-dynamic";

// Create a Stripe Checkout session for the Pro plan and return its URL.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  const env = await getEnv();
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_PRO) {
    return NextResponse.json(
      { ok: false, error: "Billing is not configured yet." },
      { status: 503 }
    );
  }

  const origin = env.APP_URL ?? new URL(req.url).origin;
  const stripe = await getStripe();

  // Reuse an existing Stripe customer for this user, or create one.
  let customerId = await getCustomerId(user.id);
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await setCustomerId(user.id, customerId);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: env.STRIPE_PRICE_PRO, quantity: 1 }],
    subscription_data: { metadata: { userId: user.id } },
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ ok: true, url: session.url });
}
