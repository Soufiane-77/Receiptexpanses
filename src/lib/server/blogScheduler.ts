import { generatePost } from "./blogPipeline";
import {
  insertPost,
  listPostLites,
  nextQueuedKeyword,
  reclaimStaleProcessing,
  setKeywordStatus,
} from "./blogStore";
import {
  loadSettings,
  publishedTodayCount,
  recordPublish,
  type BlogSettings,
} from "./blogSettings";
import { submitForIndexing, type IndexStatus } from "./blogIndexing";

/**
 * One scheduler tick. Pops the next queued keyword, runs the generation
 * pipeline, publishes (or saves a draft per settings), submits for indexing,
 * and records the outcome. Processes exactly ONE keyword per tick to control
 * cost and rate. Idempotent and safe to retry.
 *
 * Called by:
 *   - the external cron (/api/cron/run)            -> force = false
 *   - the admin "Run one now" button               -> force = true (bypass cadence)
 */
export type TickResult = {
  published: boolean;
  reason: string;
  slug?: string;
  status?: "draft" | "published";
  keyword?: string;
  index?: IndexStatus;
  /** Keywords put back in the queue after an interrupted previous run. */
  reclaimed?: number;
};

function cadenceBlock(s: BlogSettings): string | null {
  if (!s.running) return "Scheduler is paused.";
  if (publishedTodayCount(s) >= s.dailyCap) return `Daily cap reached (${s.dailyCap}/day).`;
  if (s.lastRunAt) {
    const mins = (Date.now() - s.lastRunAt) / 60_000;
    if (mins < s.minSpacingMinutes) {
      return `Too soon — min spacing ${s.minSpacingMinutes}m (${Math.ceil(s.minSpacingMinutes - mins)}m left).`;
    }
    const hrs = mins / 60;
    if (hrs < s.intervalHours) {
      return `Not due yet (${(s.intervalHours - hrs).toFixed(1)}h remaining).`;
    }
  }
  return null;
}

export async function runScheduler(
  env: { DB: D1Database; AI: Ai },
  opts: { force?: boolean } = {}
): Promise<TickResult> {
  const db = env.DB;
  const settings = await loadSettings(db);

  if (!opts.force) {
    const blocked = cadenceBlock(settings);
    if (blocked) return { published: false, reason: blocked };
  }

  // Self-heal: a previous tick may have died after claiming a keyword, which
  // would otherwise strand it in `processing` forever.
  const reclaimed = await reclaimStaleProcessing(db);

  const next = await nextQueuedKeyword(db);
  if (!next) {
    return {
      published: false,
      reason: "Queue is empty — add keywords.",
      reclaimed,
    };
  }

  await setKeywordStatus(db, next.id, "processing");

  const existing = await listPostLites(db);
  const result = await generatePost({ AI: env.AI }, next.keyword, settings, existing);

  if (!result.ok) {
    const status = /^Skipped/i.test(result.reason) ? "skipped_duplicate" : "failed";
    await setKeywordStatus(db, next.id, status, { error: result.reason });
    return { published: false, reason: result.reason, keyword: next.keyword, reclaimed };
  }

  await insertPost(db, result.post);
  await setKeywordStatus(db, next.id, "published", { postSlug: result.post.slug });
  await recordPublish(db);

  let index: IndexStatus | undefined;
  if (result.post.status === "published") {
    index = await submitForIndexing(db, result.post.slug);
  }

  return {
    published: true,
    reason: `${result.post.status === "published" ? "Published" : "Saved draft"} "${result.post.title}".`,
    slug: result.post.slug,
    status: result.post.status as "draft" | "published",
    keyword: next.keyword,
    index,
    reclaimed,
  };
}
