/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static HTML export — Cloudflare Pages serves the generated `out/` directory.
  output: "export",
  // next/image optimization needs a server; disable it for the static export.
  images: { unoptimized: true },
};

export default nextConfig;
