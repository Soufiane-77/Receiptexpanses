import CreateClient from "./CreateClient";

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  return <CreateClient template={template} />;
}
