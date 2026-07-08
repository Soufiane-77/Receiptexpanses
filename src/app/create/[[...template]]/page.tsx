import CreateClient from "../CreateClient";

// Optional catch-all so the editor lives at a clean path:
//   /create            → blank / restore draft
//   /create/{templateId} → preselected template (replaces the old
//                          /create?template= query URL)
export default async function CreatePage({
  params,
}: {
  params: Promise<{ template?: string[] }>;
}) {
  const { template } = await params;
  return <CreateClient template={template?.[0]} />;
}
