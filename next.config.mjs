/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;

// Provides Cloudflare bindings (D1, env) via getCloudflareContext() during
// `next dev` only. Guarded so it never starts the Workers runtime at build time.
// See https://opennext.js.org/cloudflare
if (process.env.NODE_ENV === "development") {
  const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
  await initOpenNextCloudflareForDev();
}
