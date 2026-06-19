import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "@/lib/blog";
import NewsletterForm from "@/components/NewsletterForm";
import { getDB } from "@/lib/server/db";
import { listPublishedPosts } from "@/lib/server/blogStore";

// Posts now live in D1 and are rendered per request so newly automated posts
// appear immediately (and are crawlable). Cheap read; fine on the free tier.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog · ReceiptExpenses",
  description: "Receipt tips, freelancing how-tos, and product updates from ReceiptExpenses.",
};

type Card = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readMins: number;
  cover: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

async function getCards(): Promise<Card[]> {
  let dbPosts: Card[] = [];
  try {
    const db = await getDB();
    dbPosts = (await listPublishedPosts(db, 100)).map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: p.date,
      readMins: p.readMins,
      cover: p.cover,
    }));
  } catch {
    // D1 unavailable (e.g. local build prerender) — fall back to static posts only.
    dbPosts = [];
  }
  const statics: Card[] = POSTS.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    readMins: p.readMins,
    cover: p.cover,
  }));
  // D1 posts win on slug collision; sort newest first.
  const bySlug = new Map<string, Card>();
  [...statics, ...dbPosts].forEach((c) => bySlug.set(c.slug, c));
  return [...bySlug.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export default async function BlogIndex() {
  const cards = await getCards();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">The ReceiptExpenses Blog</h1>
        <p className="mt-2 text-slate-600">
          Practical guides on receipts, expenses, and running a small business.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {cards.map((post) => (
            <Link
              key={post.slug}
              href={`/blogs/${post.slug}`}
              className="group flex gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-4xl">
                {post.cover}
              </div>
              <div>
                <div className="text-xs text-slate-400">
                  {formatDate(post.date)} · {post.readMins} min read
                </div>
                <h2 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-brand-600">
                  {post.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        <aside className="lg:col-span-1">
          <NewsletterForm />
        </aside>
      </div>
    </main>
  );
}
