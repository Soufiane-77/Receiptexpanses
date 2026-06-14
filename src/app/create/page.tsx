import CreateClient from "./CreateClient";

// Statically exported; the `?template=` query param is read client-side
// (see CreateClient) so this page needs no server-side searchParams.
export default function CreatePage() {
  return <CreateClient />;
}
