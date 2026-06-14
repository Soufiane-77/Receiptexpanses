import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/blog";
import { TEMPLATES } from "@/templates/registry";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const core = [
    { path: "", priority: 1.0, freq: "weekly" as const },
    { path: "/create", priority: 0.9, freq: "weekly" as const },
    { path: "/receipts", priority: 0.9, freq: "weekly" as const },
    { path: "/pricing", priority: 0.7, freq: "monthly" as const },
    { path: "/blogs", priority: 0.7, freq: "weekly" as const },
    { path: "/faq", priority: 0.6, freq: "monthly" as const },
    { path: "/about", priority: 0.5, freq: "yearly" as const },
    { path: "/privacy", priority: 0.3, freq: "yearly" as const },
    { path: "/terms", priority: 0.3, freq: "yearly" as const },
    { path: "/login", priority: 0.3, freq: "yearly" as const },
    { path: "/signup", priority: 0.4, freq: "yearly" as const },
  ].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  const receiptTypes = TEMPLATES.map((t) => ({
    url: `${SITE_URL}/receipts/${t.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const posts = POSTS.map((p) => ({
    url: `${SITE_URL}/blogs/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...core, ...receiptTypes, ...posts];
}
