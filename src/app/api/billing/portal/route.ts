import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";
import { getStripe } from "@/lib/server/stripe";
import { getEnv } from "@/lib/server/db";
import { getCustomerId } from "@/lib/server/subscriptions";

export const dynamic = "force-dynamic";

// Open the Stripe Billing customer portal (manage / cancel subscription).
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  const env = await getEnv();
  if (!env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ ok: false, error: "Billing is not configured yet." }, { status: 503 });
  }

  const customerId = await getCustomerId(user.id);
  if (!customerId) {
    return NextResponse.json({ ok: false, error: "No billing account found." }, { status: 400 });
  }

  const origin = env.APP_URL ?? new URL(req.url).origin;
  const stripe = await getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/dashboard`,
  });

  return NextResponse.json({ ok: true, url: session.url });
}
