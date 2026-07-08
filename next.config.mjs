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
if (process.env.NODE_ENV === "development") {
  const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
  await initOpenNextCloudflareForDev();
}
