// Admin-managed custom code snippets. See migrations/0007 for the security note:
// the write path must stay behind BLOG_ADMIN_TOKEN.

export type SiteSnippets = {
  enabled: boolean;
  headHtml: string;
  bodyHtml: string;
  updatedAt: number;
};

export const EMPTY_SNIPPETS: SiteSnippets = {
  enabled: false,
  headHtml: "",
  bodyHtml: "",
  updatedAt: 0,
};

/** Hard cap so a runaway paste can't bloat every page load. */
export const MAX_SNIPPET_CHARS = 20_000;

type Row = {
  enabled: number;
  head_html: string | null;
  body_html: string | null;
  updated_at: number | null;
};

export async function getSnippets(db: D1Database): Promise<SiteSnippets> {
  const row = await db
    .prepare("SELECT enabled, head_html, body_html, updated_at FROM site_snippets WHERE id = 1")
    .first<Row>();
  if (!row) return EMPTY_SNIPPETS;
  return {
    enabled: row.enabled === 1,
    headHtml: row.head_html ?? "",
    bodyHtml: row.body_html ?? "",
    updatedAt: row.updated_at ?? 0,
  };
}

export async function saveSnippets(
  db: D1Database,
  patch: { enabled?: boolean; headHtml?: string; bodyHtml?: string }
): Promise<SiteSnippets> {
  const current = await getSnippets(db);
  const next: SiteSnippets = {
    enabled: patch.enabled ?? current.enabled,
    headHtml: (patch.headHtml ?? current.headHtml).slice(0, MAX_SNIPPET_CHARS),
    bodyHtml: (patch.bodyHtml ?? current.bodyHtml).slice(0, MAX_SNIPPET_CHARS),
    updatedAt: Date.now(),
  };
  await db
    .prepare(
      `INSERT INTO site_snippets (id, enabled, head_html, body_html, updated_at)
       VALUES (1, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         enabled = excluded.enabled,
         head_html = excluded.head_html,
         body_html = excluded.body_html,
         updated_at = excluded.updated_at`
    )
    .bind(next.enabled ? 1 : 0, next.headHtml, next.bodyHtml, next.updatedAt)
    .run();
  return next;
}
