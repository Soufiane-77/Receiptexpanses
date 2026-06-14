"use client";

import { newId } from "./id";
import { slugify, upsertPost, type UpsertInput } from "./cms";

/**
 * Client-side blog automation. Given keywords + a cadence, it builds a queue of
 * scheduled jobs and, while the admin tab is open, generates and publishes a
 * template-based article for each due job.
 *
 * LIMITS (be honest about them in the UI):
 * - The scheduler only runs while the admin tab is OPEN — there is no server
 *   cron, so it cannot publish unattended after you close the tab.
 * - Articles are generated from a local template, not a real LLM. `generateArticle`
 *   is the single seam to swap in a backend LLM call later.
 * - Published posts live in this browser's localStorage (see lib/cms.ts caveats).
 */

const CONFIG_KEY = "receiptforge:automation-config";
const QUEUE_KEY = "receiptforge:automation-queue";

export type AutomationConfig = {
  keywords: string[];
  quantity: number;
  intervalMinutes: number;
  startAt: string; // ISO
  author: string;
  cover: string; // emoji
  running: boolean;
};

export type JobStatus = "pending" | "published";

export type QueueJob = {
  id: string;
  keyword: string;
  scheduledAt: string; // ISO
  status: JobStatus;
  postSlug?: string;
  publishedAt?: string;
};

export function defaultConfig(): AutomationConfig {
  return {
    keywords: [],
    quantity: 5,
    intervalMinutes: 60,
    startAt: new Date().toISOString(),
    author: "ReceiptExpenses Team",
    cover: "📝",
    running: false,
  };
}

function safe<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadConfig(): AutomationConfig {
  if (typeof window === "undefined") return defaultConfig();
  return { ...defaultConfig(), ...safe<Partial<AutomationConfig>>(window.localStorage.getItem(CONFIG_KEY), {}) };
}

export function saveConfig(c: AutomationConfig): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
}

export function loadQueue(): QueueJob[] {
  if (typeof window === "undefined") return [];
  return safe<QueueJob[]>(window.localStorage.getItem(QUEUE_KEY), []);
}

export function saveQueue(q: QueueJob[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export function clearQueue(): void {
  saveQueue([]);
}

/** Parse a textarea of keywords (one per line or comma-separated). */
export function parseKeywords(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Build a queue from the config: `quantity` jobs, one every `intervalMinutes`,
 * cycling through the keyword list. Appends to any existing queue.
 */
export function buildQueue(config: AutomationConfig): QueueJob[] {
  if (config.keywords.length === 0 || config.quantity < 1) return loadQueue();
  const start = new Date(config.startAt).getTime() || Date.now();
  const jobs: QueueJob[] = [];
  for (let i = 0; i < config.quantity; i++) {
    jobs.push({
      id: newId(),
      keyword: config.keywords[i % config.keywords.length]!,
      scheduledAt: new Date(start + i * config.intervalMinutes * 60_000).toISOString(),
      status: "pending",
    });
  }
  const next = [...loadQueue(), ...jobs];
  saveQueue(next);
  return next;
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Generate a useful, domain-relevant article from a keyword.
 * SINGLE SEAM: replace this body with a backend LLM call for real generation.
 */
export function generateArticle(keyword: string, author: string, cover: string): UpsertInput {
  const k = keyword.trim();
  const title = `${titleCase(k)}: a quick, practical guide`;
  return {
    title,
    slug: slugify(k),
    excerpt: `Everything you need to know about ${k.toLowerCase()} — what to include, common mistakes, and how to make one in under a minute.`,
    author,
    cover,
    status: "published",
    source: "auto",
    keyword: k,
    body: [
      { type: "p", text: `Whether you run a small business or just need to keep clean records, knowing how to handle a ${k.toLowerCase()} saves time and avoids confusion at tax time.` },
      { type: "h2", text: "What to include" },
      {
        type: "ul",
        items: [
          "Your business name, address and contact details",
          "A unique receipt number and the date/time",
          "An itemized list with quantity and unit price",
          "Subtotal, tax (with the rate) and a clearly marked total",
          "The payment method used",
        ],
      },
      { type: "h2", text: "Common mistakes to avoid" },
      {
        type: "ul",
        items: [
          "Skipping the receipt number — it makes records hard to reconcile",
          "Rounding inconsistently — let the tool do the math",
          "Forgetting the tax line when it applies",
        ],
      },
      { type: "h2", text: `Make a ${k.toLowerCase()} with ReceiptExpenses` },
      { type: "p", text: "Pick a template, fill in your business and items, and watch the receipt build live. When it looks right, download a PDF or PNG — everything runs in your browser, so nothing is uploaded." },
      { type: "p", text: "It takes less than a minute, and you can save it to come back to later." },
    ],
  };
}

/**
 * Publish every pending job whose time has arrived. Returns slugs published.
 * Call this on an interval from the open admin tab.
 */
export function processDueJobs(): string[] {
  const config = loadConfig();
  const now = Date.now();
  const queue = loadQueue();
  const published: string[] = [];

  const next = queue.map((job) => {
    if (job.status !== "pending") return job;
    if (new Date(job.scheduledAt).getTime() > now) return job;
    const post = upsertPost(generateArticle(job.keyword, config.author, config.cover));
    published.push(post.slug);
    return { ...job, status: "published" as JobStatus, postSlug: post.slug, publishedAt: new Date().toISOString() };
  });

  if (published.length) saveQueue(next);
  return published;
}
