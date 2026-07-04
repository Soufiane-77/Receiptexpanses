// Reads the guides-workflow output and emits one TS content module per guide
// into src/content/guides/<slug>.ts. Run: node scripts/gen-guides.mjs <output.json>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "src/content/guides";
const PUBLISHED = "2026-07-04";
const MODIFIED = "2026-07-04";

const outputPath = process.argv[2];
if (!outputPath) {
  console.error("usage: node scripts/gen-guides.mjs <workflow-output.json>");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(outputPath, "utf8"));
const guides = raw?.result?.guides;
if (!Array.isArray(guides)) {
  console.error("no result.guides array in output");
  process.exit(1);
}

// slug -> camelCase export name (must match src/content/guides/index.ts imports)
function exportName(slug) {
  return slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

// Minimal, valid-slug guard + block sanity check.
const VALID_TYPES = new Set(["p", "h2", "h3", "ul", "ol", "table", "cta", "faq", "image"]);

let count = 0;
for (const g of guides) {
  if (!g || typeof g.slug !== "string") {
    console.error("skipping guide with no slug");
    continue;
  }
  // Drop any block with an unknown type (defensive; verifier should have caught).
  const body = Array.isArray(g.body) ? g.body.filter((b) => b && VALID_TYPES.has(b.type)) : [];

  const guide = {
    slug: g.slug,
    title: g.title,
    metaTitle: g.metaTitle,
    metaDescription: g.metaDescription,
    tldr: g.tldr,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    category: g.category,
    body,
    ...(Array.isArray(g.howToSteps) && g.howToSteps.length ? { howToSteps: g.howToSteps } : {}),
    relatedGuides: Array.isArray(g.relatedGuides) ? g.relatedGuides : [],
    relatedTemplates: Array.isArray(g.relatedTemplates) ? g.relatedTemplates : [],
  };

  const name = exportName(g.slug);
  const content = `import type { Guide } from "@/lib/guides";

// Cornerstone guide — authored + adversarially compliance-reviewed. Body uses the
// shared Block model (src/lib/blog.ts) and renders via <PostBody>.
export const ${name}: Guide = ${JSON.stringify(guide, null, 2)};
`;
  writeFileSync(join(OUT_DIR, `${g.slug}.ts`), content, "utf8");
  count++;
  console.log(`wrote ${OUT_DIR}/${g.slug}.ts (${body.length} blocks${guide.howToSteps ? ", HowTo" : ""})`);
}
console.log(`\ndone: ${count} guide modules`);
