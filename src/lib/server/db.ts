import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Returns the D1 database binding for the current request.
 *
 * Server-only — call from route handlers / server code, never from client
 * components. Uses the async form of getCloudflareContext so it works in any
 * server context.
 */
export async function getDB(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.DB) {
    throw new Error(
      "D1 binding 'DB' is not configured. Create the database (npx wrangler d1 create receiptexpanses-db), set its id in wrangler.jsonc, and run the migrations."
    );
  }
  return env.DB;
}

/** Returns the full Cloudflare env (bindings + vars) for the current request. */
export async function getEnv(): Promise<CloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env;
}
