/**
 * Single-row global config for the Autopilot Blog engine (blog_settings, id=1).
 */

export type BlogSettings = {
  autoPublish: boolean;
  running: boolean;
  intervalHours: number;
  dailyCap: number;
  minSpacingMinutes: number;
  author: string;
  cover: string;
  brandVoice: string;
  model: string;
  minWordCount: number;
  internalLinkDensity: number;
  ctaText: string;
  ctaUrl: string;
  ctaLabel: string;
  enableIndexNow: boolean;
  enableGoogleIndexing: boolean;
  indexNowKey: string | null;
  lastRunAt: number | null;
  publishedToday: number;
  publishedTodayDate: string | null;
};

type SettingsRow = {
  auto_publish: number;
  running: number;
  interval_hours: number;
  daily_cap: number;
  min_spacing_minutes: number;
  author: string;
  cover: string;
  brand_voice: string;
  model: string;
  min_word_count: number;
  internal_link_density: number;
  cta_text: string;
  cta_url: string;
  cta_label: string;
  enable_indexnow: number;
  enable_google_indexing: number;
  indexnow_key: string | null;
  last_run_at: number | null;
  published_today: number;
  published_today_date: string | null;
};

function rowToSettings(r: SettingsRow): BlogSettings {
  return {
    autoPublish: r.auto_publish === 1,
    running: r.running === 1,
    intervalHours: r.interval_hours,
    dailyCap: r.daily_cap,
    minSpacingMinutes: r.min_spacing_minutes,
    author: r.author,
    cover: r.cover,
    brandVoice: r.brand_voice,
    model: r.model,
    minWordCount: r.min_word_count,
    internalLinkDensity: r.internal_link_density,
    ctaText: r.cta_text,
    ctaUrl: r.cta_url,
    ctaLabel: r.cta_label,
    enableIndexNow: r.enable_indexnow === 1,
    enableGoogleIndexing: r.enable_google_indexing === 1,
    indexNowKey: r.indexnow_key,
    lastRunAt: r.last_run_at,
    publishedToday: r.published_today,
    publishedTodayDate: r.published_today_date,
  };
}

export async function loadSettings(db: D1Database): Promise<BlogSettings> {
  const row = await db.prepare("SELECT * FROM blog_settings WHERE id = 1").first<SettingsRow>();
  if (!row) {
    // Defaults mirror the migration; the seed row should always exist.
    return rowToSettings({
      auto_publish: 0,
      running: 0,
      interval_hours: 24,
      daily_cap: 2,
      min_spacing_minutes: 60,
      author: "The ReceiptExpenses Team",
      cover: "📝",
      brand_voice:
        "Friendly, concrete and practical. Speak to small-business owners and freelancers. No fluff, no hype, no keyword stuffing.",
      model: "@cf/meta/llama-3.1-8b-instruct-fp8",
      min_word_count: 600,
      internal_link_density: 3,
      cta_text: "Create a professional receipt in under a minute — free to preview.",
      cta_url: "/create",
      cta_label: "Start creating",
      enable_indexnow: 1,
      enable_google_indexing: 0,
      indexnow_key: null,
      last_run_at: null,
      published_today: 0,
      published_today_date: null,
    });
  }
  return rowToSettings(row);
}

export type SettingsPatch = Partial<
  Pick<
    BlogSettings,
    | "autoPublish"
    | "running"
    | "intervalHours"
    | "dailyCap"
    | "minSpacingMinutes"
    | "author"
    | "cover"
    | "brandVoice"
    | "model"
    | "minWordCount"
    | "internalLinkDensity"
    | "ctaText"
    | "ctaUrl"
    | "ctaLabel"
    | "enableIndexNow"
    | "enableGoogleIndexing"
  >
>;

export async function saveSettings(db: D1Database, patch: SettingsPatch): Promise<BlogSettings> {
  const cur = await loadSettings(db);
  const n = { ...cur, ...patch };
  await db
    .prepare(
      `UPDATE blog_settings SET
         auto_publish=?, running=?, interval_hours=?, daily_cap=?, min_spacing_minutes=?,
         author=?, cover=?, brand_voice=?, model=?, min_word_count=?, internal_link_density=?,
         cta_text=?, cta_url=?, cta_label=?, enable_indexnow=?, enable_google_indexing=?, updated_at=?
       WHERE id = 1`
    )
    .bind(
      n.autoPublish ? 1 : 0,
      n.running ? 1 : 0,
      Math.max(1, n.intervalHours),
      Math.max(1, n.dailyCap),
      Math.max(0, n.minSpacingMinutes),
      n.author,
      n.cover,
      n.brandVoice,
      n.model,
      Math.max(200, n.minWordCount),
      Math.max(0, n.internalLinkDensity),
      n.ctaText,
      n.ctaUrl,
      n.ctaLabel,
      n.enableIndexNow ? 1 : 0,
      n.enableGoogleIndexing ? 1 : 0,
      Date.now()
    )
    .run();
  return loadSettings(db);
}

/** Ensure an IndexNow key exists (32-char hex hosted at /<key>.txt). Returns it. */
export async function ensureIndexNowKey(db: D1Database): Promise<string> {
  const cur = await loadSettings(db);
  if (cur.indexNowKey) return cur.indexNowKey;
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const key = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  await db.prepare("UPDATE blog_settings SET indexnow_key = ? WHERE id = 1").bind(key).run();
  return key;
}

/** Record a successful publish: bump last_run_at and the daily counter (resets per day). */
export async function recordPublish(db: D1Database): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const cur = await loadSettings(db);
  const count = cur.publishedTodayDate === today ? cur.publishedToday + 1 : 1;
  await db
    .prepare(
      "UPDATE blog_settings SET last_run_at = ?, published_today = ?, published_today_date = ? WHERE id = 1"
    )
    .bind(Date.now(), count, today)
    .run();
}

/** Posts published today, accounting for the date rollover. */
export function publishedTodayCount(s: BlogSettings): number {
  const today = new Date().toISOString().slice(0, 10);
  return s.publishedTodayDate === today ? s.publishedToday : 0;
}
