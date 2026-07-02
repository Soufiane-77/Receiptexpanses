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
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "Meta-ExternalAgent",
    "DuckAssistBot",
    "CCBot",
    "cohere-ai",
    "MistralAI-User",
  ];
  // Account, auth and API pathways are never useful to crawl; everything else
  // (including /llms.txt and all template landing pages) is open.
  const restricted = ["/admin", "/dashboard", "/api/", "/auth/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: restricted },
      { userAgent: aiAgents, allow: "/", disallow: restricted },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
