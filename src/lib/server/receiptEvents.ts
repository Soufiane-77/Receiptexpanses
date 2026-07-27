// Receipt generation analytics — METADATA ONLY (see migrations/0006).
// Never persist receipt content here; the site publicly promises receipt data
// never leaves the browser.

export type ReceiptAction = "pdf" | "png" | "print" | "save";

export const RECEIPT_ACTIONS: ReceiptAction[] = ["pdf", "png", "print", "save"];

export function isReceiptAction(v: unknown): v is ReceiptAction {
  return typeof v === "string" && (RECEIPT_ACTIONS as string[]).includes(v);
}

/** Record one receipt-generation event. */
export async function recordReceiptEvent(
  db: D1Database,
  e: { templateId: string; action: ReceiptAction; userId?: string | null; userEmail?: string | null }
): Promise<void> {
  const day = new Date().toISOString().slice(0, 10);
  await db
    .prepare(
      `INSERT INTO receipt_events (day, template_id, action, user_id, user_email)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      day,
      e.templateId.slice(0, 64),
      e.action,
      e.userId ?? null,
      e.userEmail ? e.userEmail.slice(0, 320) : null
    )
    .run();
}

export type ReceiptStats = {
  days: number;
  total: number;
  totalAllTime: number;
  signedIn: number;
  anonymous: number;
  byAction: { action: string; count: number }[];
  byTemplate: { templateId: string; count: number }[];
  byDay: { day: string; count: number }[];
  topUsers: { userId: string; email: string | null; count: number; lastAt: string }[];
  recent: {
    createdAt: string;
    templateId: string;
    action: string;
    email: string | null;
  }[];
};

/** Aggregate receipt activity for the admin panel. */
export async function getReceiptStats(db: D1Database, days: number): Promise<ReceiptStats> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

  const [totals, allTime, byAction, byTemplate, byDay, topUsers, recent] = await Promise.all([
    db
      .prepare(
        `SELECT COUNT(*) AS total,
                SUM(CASE WHEN user_id IS NOT NULL THEN 1 ELSE 0 END) AS signed_in
           FROM receipt_events WHERE day >= ?`
      )
      .bind(since)
      .first<{ total: number; signed_in: number | null }>(),
    db.prepare(`SELECT COUNT(*) AS total FROM receipt_events`).first<{ total: number }>(),
    db
      .prepare(
        `SELECT action, COUNT(*) AS count FROM receipt_events
          WHERE day >= ? GROUP BY action ORDER BY count DESC`
      )
      .bind(since)
      .all<{ action: string; count: number }>(),
    db
      .prepare(
        `SELECT template_id, COUNT(*) AS count FROM receipt_events
          WHERE day >= ? GROUP BY template_id ORDER BY count DESC LIMIT 30`
      )
      .bind(since)
      .all<{ template_id: string; count: number }>(),
    db
      .prepare(
        `SELECT day, COUNT(*) AS count FROM receipt_events
          WHERE day >= ? GROUP BY day ORDER BY day ASC`
      )
      .bind(since)
      .all<{ day: string; count: number }>(),
    db
      .prepare(
        `SELECT user_id, MAX(user_email) AS email, COUNT(*) AS count, MAX(created_at) AS last_at
           FROM receipt_events
          WHERE day >= ? AND user_id IS NOT NULL
          GROUP BY user_id ORDER BY count DESC LIMIT 20`
      )
      .bind(since)
      .all<{ user_id: string; email: string | null; count: number; last_at: string }>(),
    db
      .prepare(
        `SELECT created_at, template_id, action, user_email
           FROM receipt_events ORDER BY id DESC LIMIT 50`
      )
      .all<{ created_at: string; template_id: string; action: string; user_email: string | null }>(),
  ]);

  const total = totals?.total ?? 0;
  const signedIn = totals?.signed_in ?? 0;

  return {
    days,
    total,
    totalAllTime: allTime?.total ?? 0,
    signedIn,
    anonymous: Math.max(0, total - signedIn),
    byAction: (byAction.results ?? []).map((r) => ({ action: r.action, count: r.count })),
    byTemplate: (byTemplate.results ?? []).map((r) => ({
      templateId: r.template_id,
      count: r.count,
    })),
    byDay: (byDay.results ?? []).map((r) => ({ day: r.day, count: r.count })),
    topUsers: (topUsers.results ?? []).map((r) => ({
      userId: r.user_id,
      email: r.email,
      count: r.count,
      lastAt: r.last_at,
    })),
    recent: (recent.results ?? []).map((r) => ({
      createdAt: r.created_at,
      templateId: r.template_id,
      action: r.action,
      email: r.user_email,
    })),
  };
}
