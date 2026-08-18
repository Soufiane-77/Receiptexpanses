/**
 * Worker entry point.
 *
 * OpenNext generates `.open-next/worker.js`, which only exports a `fetch`
 * handler. Cloudflare Cron Triggers invoke `scheduled()`, so without this
 * wrapper there is no way to run anything on a schedule — which is why the
 * Autopilot Blog never published on its own and its queue sat idle.
 *
 * This re-exports the generated worker untouched and adds `scheduled()`, which
 * drives one blog scheduler tick per firing. Cadence (interval_hours,
 * daily_cap, min_spacing_minutes) is enforced inside the tick, so the cron can
 * fire often and harmlessly no-op — see wrangler.jsonc `triggers.crons`.
 */
import openNextWorker, {
  DOQueueHandler,
  DOShardedTagCache,
  BucketCachePurge,
} from "./.open-next/worker.js";

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge };

export default {
  ...openNextWorker,

  async scheduled(controller, env, ctx) {
    const token = (env.BLOG_ADMIN_TOKEN ?? "").trim();
    if (!token) {
      console.log("[cron] BLOG_ADMIN_TOKEN not set — skipping blog tick.");
      return;
    }

    // Drive the existing, already-authenticated cron route through our own
    // fetch handler. Keeps one code path for manual and scheduled runs, and
    // avoids a public round-trip.
    const base = (env.APP_URL ?? "https://receiptexpenses.com").replace(/\/+$/, "");
    const req = new Request(`${base}/api/cron/run?token=${encodeURIComponent(token)}`, {
      method: "POST",
    });

    const run = (async () => {
      try {
        const res = await openNextWorker.fetch(req, env, ctx);
        const body = await res.text();
        console.log(`[cron] blog tick ${res.status}: ${body.slice(0, 300)}`);
      } catch (err) {
        console.error(`[cron] blog tick failed: ${String(err)}`);
      }
    })();

    // Keep the invocation alive until the tick resolves.
    ctx.waitUntil(run);
    await run;
  },
};
