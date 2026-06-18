import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Required for `output: export` — emit a static robots.txt at build time.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Welcome general crawlers and explicitly allow AI assistants / agents so the
  // site (and /llms.txt) can be discovered and cited by LLM-based tools.
  const aiAgents = [
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "ClaudeBot",
    "anthropic-ai",
    "Claude-Web",
    "PerplexityBot",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
    "cohere-ai",
  ];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard"] },
      { userAgent: aiAgents, allow: "/", disallow: ["/admin", "/dashboard"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
