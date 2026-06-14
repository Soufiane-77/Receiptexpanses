import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// This app has no ISR / on-demand revalidation, so no incremental cache
// override is needed. Add one (e.g. r2IncrementalCache) here if that changes.
export default defineCloudflareConfig();
