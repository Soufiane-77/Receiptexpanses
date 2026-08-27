import type { Metadata } from "next";
import CreateClient from "../CreateClient";
import { TEMPLATES } from "@/templates/registry";

// Optional catch-all so the editor lives at a clean path:
//   /create            → blank / restore draft
//   /create/{templateId} → preselected template (replaces the old
//                          /create?template= query URL)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ template?: string[] }>;
}): Promise<Metadata> {
  const { template } = await params;
  const id = template?.[0];
  const t = id ? TEMPLATES.find((x) => x.id === id) : undefined;

  // Per-template editor URLs are near-identical app shells and would compete
  // with the keyword landing pages that actually rank, so they stay out of the
  // index while still passing link equity onward.
  if (t) {
    return {
      title: `${t.name} editor · ReceiptExpenses`,
      description: `Fill in and preview a ${t.seo.keyword} in your browser, then download it as a PDF or PNG.`,
      robots: { index: false, follow: true },
      alternates: { canonical: `/create/${t.id}` },
    };
  }

  return {
    title: { absolute: "Create a Receipt Online — Free Receipt Editor" },
    description:
      "Build a receipt in your browser: choose a template, add your items, tax and logo, preview it live, then download a pixel-perfect PDF or PNG.",
    alternates: { canonical: "/create" },
  };
}

export default async function CreatePage({
  params,
}: {
  params: Promise<{ template?: string[] }>;
}) {
  const { template } = await params;
  const id = template?.[0];
  const t = id ? TEMPLATES.find((x) => x.id === id) : undefined;

  return (
    <>
      {/* The editor is a client app whose UI carries no heading of its own, so
          the page rendered with no <h1> at all. This one is server-rendered and
          visually hidden: it names the page for crawlers and screen readers
          without intruding on the editor chrome. */}
      <h1 className="sr-only">
        {t ? `${t.name} editor — create and download a ${t.seo.keyword}` : "Create a receipt online"}
      </h1>
      <CreateClient template={id} />
    </>
  );
}
