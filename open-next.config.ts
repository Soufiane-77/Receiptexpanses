import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No ISR / on-demand revalidation in this app, so no incremental cache override
// is needed. D1 and other bindings are configured in wrangler.jsonc.
export default defineCloudflareConfig();
