/**
 * Read-side rollups over the referral_events table (see migration 0005).
 * Feeds the admin referral view so AI-answer-engine traffic (ChatGPT, Claude,
 * Perplexity, Gemini, Copilot…) is visible. Write path is /api/track.
 */

export type SourceRollup = {
  source: string;
  label: string;
  medium: string;
  isAI: boolean;
  hits: number;
};

export type ReferralStats = {
  totalHits: number;
  aiHits: number;
  bySource: SourceRollup[];
  aiByDay: { day: string; hits: number }[];
  windowDays: number;
};

/** Aggregate the last `windowDays` of referral events. */
export async function getReferralStats(db: D1Database, windowDays = 30): Promise<ReferralStats> {
  const since = new Date(Date.now() - windowDays * 86_400_000).toISOString().slice(0, 10);

  const bySourceRes = await db
    .prepare(
      `SELECT source, label, medium, is_ai AS isAI, COUNT(*) AS hits
         FROM referral_events
        WHERE day >= ?
        GROUP BY source, label, medium, is_ai
        ORDER BY hits DESC`
    )
    .bind(since)
    .all<{ source: string; label: string; medium: string; isAI: number; hits: number }>();

  const bySource: SourceRollup[] = (bySourceRes.results ?? []).map((r) => ({
    source: r.source,
    label: r.label,
    medium: r.medium,
    isAI: r.isAI === 1,
    hits: r.hits,
  }));

  const aiByDayRes = await db
    .prepare(
      `SELECT day, COUNT(*) AS hits
         FROM referral_events
        WHERE day >= ? AND is_ai = 1
        GROUP BY day
        ORDER BY day ASC`
    )
    .bind(since)
    .all<{ day: string; hits: number }>();

  const totalHits = bySource.reduce((n, r) => n + r.hits, 0);
  const aiHits = bySource.filter((r) => r.isAI).reduce((n, r) => n + r.hits, 0);

  return {
    totalHits,
    aiHits,
    bySource,
    aiByDay: aiByDayRes.results ?? [],
    windowDays,
  };
}
