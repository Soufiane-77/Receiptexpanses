/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Kill the legacy editor query URL: /create?template=jordan → /create/jordan
      {
        source: "/create",
        has: [{ type: "query", key: "template", value: "(?<t>[^&/]+)" }],
        destination: "/create/:t",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

// Provides Cloudflare bindings (D1, env) via getCloudflareContext() during
// `next dev` only. Guarded so it never starts the Workers runtime at build time.
// See https://opennext.js.org/cloudflare
//
// Set SKIP_CF_DEV=1 to skip it: this starts a local `workerd`, which crashes with
// an access violation (0xc0000005) on some Windows machines. Skipping lets you run
// `next dev` for UI work — D1/env-backed routes won't work, but pages render.
// No effect on `build`/`deploy`.
if (process.env.NODE_ENV === "development" && process.env.SKIP_CF_DEV !== "1") {
  const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
  await initOpenNextCloudflareForDev();
}
