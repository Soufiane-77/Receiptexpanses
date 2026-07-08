import { notFound, permanentRedirect } from "next/navigation";
import { TEMPLATES, getTemplate, templateSlug } from "@/templates/registry";

// The per-template landing pages moved to keyword-rich top-level URLs
// (e.g. /receipts/apple → /apple-receipt-generator). Keep these old paths as
// permanent (308) redirects so indexed links and backlinks retain their value.

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.id }));
}

// No dynamicParams=false here: OpenNext/Cloudflare 404s dynamicParams=false
// prerendered pages. Unknown ids render on demand and hit notFound() below.

export default async function LegacyReceiptRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = TEMPLATES.find((x) => x.id === slug) ? getTemplate(slug) : undefined;
  if (!t) notFound();
  permanentRedirect(`/${templateSlug(t)}`);
}
