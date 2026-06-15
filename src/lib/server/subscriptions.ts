import { getDB } from "./db";

export type SubscriptionUpsert = {
  userId: string;
  customerId: string | null;
  subscriptionId: string | null;
  status: string;
  priceId: string | null;
  currentPeriodEnd: number | null;
};

/** Insert or update the single subscription row for a user (keyed by user_id). */
export async function upsertSubscription(data: SubscriptionUpsert): Promise<void> {
  const db = await getDB();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO subscriptions
         (id, user_id, stripe_customer_id, stripe_subscription_id, status, price_id, current_period_end, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         stripe_customer_id     = excluded.stripe_customer_id,
         stripe_subscription_id = excluded.stripe_subscription_id,
         status                 = excluded.status,
         price_id               = excluded.price_id,
         current_period_end     = excluded.current_period_end,
         updated_at             = excluded.updated_at`
    )
    .bind(
      crypto.randomUUID(),
      data.userId,
      data.customerId,
      data.subscriptionId,
      data.status,
      data.priceId,
      data.currentPeriodEnd,
      now,
      now
    )
    .run();
}

/** Return the Stripe customer id stored for a user, if any. */
export async function getCustomerId(userId: string): Promise<string | null> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?")
    .bind(userId)
    .first<{ stripe_customer_id: string | null }>();
  return row?.stripe_customer_id ?? null;
}

/** Persist a Stripe customer id for a user before any subscription exists. */
export async function setCustomerId(userId: string, customerId: string): Promise<void> {
  await upsertSubscription({
    userId,
    customerId,
    subscriptionId: null,
    status: "inactive",
    priceId: null,
    currentPeriodEnd: null,
  });
}
