import { notFound, permanentRedirect } from "next/navigation";
import { TEMPLATES, getTemplate, templateSlug } from "@/templates/registry";

// The per-template landing pages moved to keyword-rich top-level URLs
// (e.g. /receipts/apple → /apple-receipt-generator). Keep these old paths as
// permanent (308) redirects so indexed links and backlinks retain their value.

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.id }));
}

export const dynamicParams = false;

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
