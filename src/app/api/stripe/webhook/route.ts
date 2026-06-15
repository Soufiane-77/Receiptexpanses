import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/server/stripe";
import { getEnv } from "@/lib/server/db";
import { upsertSubscription } from "@/lib/server/subscriptions";
import { updateUser } from "@/lib/server/users";

export const dynamic = "force-dynamic";

// Subtle-crypto provider is required for async signature verification on Workers.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

function planForStatus(status: string): "free" | "pro" {
  return status === "active" || status === "trialing" ? "pro" : "free";
}

export async function POST(req: Request) {
  const env = await getEnv();
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Billing not configured." }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  const body = await req.text();
  const stripe = await getStripe();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      env.STRIPE_WEBHOOK_SECRET,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature.";
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      if (userId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(String(session.subscription));
        await applySubscription(userId, sub);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (userId) await applySubscription(userId, sub, event.type === "customer.subscription.deleted");
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function applySubscription(
  userId: string,
  sub: Stripe.Subscription,
  deleted = false
): Promise<void> {
  const status = deleted ? "canceled" : sub.status;
  const item = sub.items.data[0];
  const priceId = item?.price?.id ?? null;
  // In recent Stripe API versions the period boundary lives on the subscription
  // item rather than the subscription itself.
  const periodEndSec = (item as { current_period_end?: number } | undefined)?.current_period_end;
  const periodEnd = typeof periodEndSec === "number" ? periodEndSec * 1000 : null;

  await upsertSubscription({
    userId,
    customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    subscriptionId: sub.id,
    status,
    priceId,
    currentPeriodEnd: periodEnd,
  });

  const plan = planForStatus(status);
  await updateUser(userId, {
    plan,
    proSince: plan === "pro" ? new Date().toISOString() : undefined,
  });
}
