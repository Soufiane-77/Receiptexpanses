/**
 * Aggregates for the Autopilot Blog analytics dashboard. Read-only; every
 * figure comes from blog_posts / blog_keywords / blog_settings so the panel
 * reflects exactly what the automation has actually done.
 */

export type BlogAnalytics = {
  posts: { total: number; published: number; draft: number; auto: number; manual: number };
  images: { withCover: number; withoutCover: number };
  quality: { avgWords: number; minWords: number; maxWords: number; belowFloor: number };
  queue: { queued: number; published: number; failed: number; processing: number };
  perDay: { day: string; count: number }[];
  recent: {
    slug: string;
    title: string;
    status: string;
    words: number;
    hasImage: number;
    keyword: string | null;
    createdAt: number;
  }[];
  failures: { keyword: string; error: string }[];
  scheduler: {
    running: boolean;
    autoPublish: boolean;
    intervalHours: number;
    dailyCap: number;
    publishedToday: number;
    lastRunAt: number;
    minWordCount: number;
  };
};

export async function getBlogAnalytics(db: D1Database, days = 30): Promise<BlogAnalytics> {
  const sinceMs = Date.now() - days * 86_400_000;

  const [postAgg, imageAgg, qualityAgg, queueAgg, perDay, recent, failures, settings] =
    await Promise.all([
      db
        .prepare(
          `SELECT COUNT(*) AS total,
                  SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) AS published,
                  SUM(CASE WHEN status!='published' THEN 1 ELSE 0 END) AS draft,
                  SUM(CASE WHEN source='auto' THEN 1 ELSE 0 END) AS auto
             FROM blog_posts`
        )
        .first<{ total: number; published: number | null; draft: number | null; auto: number | null }>(),
      db
        .prepare(
          `SELECT SUM(CASE WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN 1 ELSE 0 END) AS with_cover,
                  SUM(CASE WHEN cover_image_url IS NULL OR cover_image_url = '' THEN 1 ELSE 0 END) AS without_cover
             FROM blog_posts`
        )
        .first<{ with_cover: number | null; without_cover: number | null }>(),
      db
        .prepare(
          `SELECT AVG(word_count) AS avg_w, MIN(word_count) AS min_w, MAX(word_count) AS max_w
             FROM blog_posts WHERE word_count > 0`
        )
        .first<{ avg_w: number | null; min_w: number | null; max_w: number | null }>(),
      db
        .prepare(`SELECT status, COUNT(*) AS n FROM blog_keywords GROUP BY status`)
        .all<{ status: string; n: number }>(),
      db
        .prepare(
          `SELECT date(created_at/1000,'unixepoch') AS day, COUNT(*) AS n
             FROM blog_posts WHERE created_at >= ? GROUP BY day ORDER BY day ASC`
        )
        .bind(sinceMs)
        .all<{ day: string; n: number }>(),
      db
        .prepare(
          `SELECT slug, title, status, word_count, keyword, created_at,
                  CASE WHEN cover_image_url IS NOT NULL AND cover_image_url != '' THEN 1 ELSE 0 END AS has_image
             FROM blog_posts ORDER BY created_at DESC LIMIT 15`
        )
        .all<{
          slug: string; title: string; status: string; word_count: number;
          keyword: string | null; created_at: number; has_image: number;
        }>(),
      db
        .prepare(
          `SELECT keyword, COALESCE(error,'') AS error FROM blog_keywords
            WHERE status='failed' AND error IS NOT NULL ORDER BY processed_at DESC LIMIT 10`
        )
        .all<{ keyword: string; error: string }>(),
      db
        .prepare(
          `SELECT running, auto_publish, interval_hours, daily_cap, published_today,
                  COALESCE(last_run_at,0) AS last_run_at, min_word_count
             FROM blog_settings WHERE id = 1`
        )
        .first<{
          running: number; auto_publish: number; interval_hours: number; daily_cap: number;
          published_today: number; last_run_at: number; min_word_count: number;
        }>(),
    ]);

  const byStatus = (s: string) =>
    (queueAgg.results ?? []).find((r) => r.status === s)?.n ?? 0;

  const floor = settings?.min_word_count ?? 600;
  const belowFloor = await db
    .prepare(`SELECT COUNT(*) AS n FROM blog_posts WHERE word_count > 0 AND word_count < ?`)
    .bind(floor)
    .first<{ n: number }>();

  return {
    posts: {
      total: postAgg?.total ?? 0,
      published: postAgg?.published ?? 0,
      draft: postAgg?.draft ?? 0,
      auto: postAgg?.auto ?? 0,
      manual: (postAgg?.total ?? 0) - (postAgg?.auto ?? 0),
    },
    images: {
      withCover: imageAgg?.with_cover ?? 0,
      withoutCover: imageAgg?.without_cover ?? 0,
    },
    quality: {
      avgWords: Math.round(qualityAgg?.avg_w ?? 0),
      minWords: qualityAgg?.min_w ?? 0,
      maxWords: qualityAgg?.max_w ?? 0,
      belowFloor: belowFloor?.n ?? 0,
    },
    queue: {
      queued: byStatus("queued"),
      published: byStatus("published"),
      failed: byStatus("failed"),
      processing: byStatus("processing"),
    },
    perDay: (perDay.results ?? []).map((r) => ({ day: r.day, count: r.n })),
    recent: (recent.results ?? []).map((r) => ({
      slug: r.slug,
      title: r.title,
      status: r.status,
      words: r.word_count,
      hasImage: r.has_image,
      keyword: r.keyword,
      createdAt: r.created_at,
    })),
    failures: (failures.results ?? []).map((r) => ({ keyword: r.keyword, error: r.error })),
    scheduler: {
      running: (settings?.running ?? 0) === 1,
      autoPublish: (settings?.auto_publish ?? 0) === 1,
      intervalHours: settings?.interval_hours ?? 24,
      dailyCap: settings?.daily_cap ?? 1,
      publishedToday: settings?.published_today ?? 0,
      lastRunAt: settings?.last_run_at ?? 0,
      minWordCount: floor,
    },
  };
}
