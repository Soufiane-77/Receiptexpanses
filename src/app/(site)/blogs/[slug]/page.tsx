import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, faqsFromBody, type Post } from "@/lib/blog";
import NewsletterForm from "@/components/NewsletterForm";
import JsonLd from "@/components/JsonLd";
import PostBody from "@/components/PostBody";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { getDB } from "@/lib/server/db";
import { getPublishedPost } from "@/lib/server/blogStore";

// Posts come from D1 (plus the original static set), rendered per request.
export const dynamic = "force-dynamic";

/** Resolve a post by slug: static set first, then D1. */
async function resolvePost(slug: string): Promise<Post | null> {
  const staticPost = getPost(slug);
  if (staticPost) return staticPost;
  try {
    const db = await getDB();
    return await getPublishedPost(db, slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await resolvePost(slug);
  if (!post) return { title: "Post not found · ReceiptExpenses" };

  const title = post.metaTitle || `${post.title} · ${SITE_NAME}`;
  const description = post.metaDescription || post.excerpt;
  const url = `${SITE_URL}/blogs/${post.slug}`;
  const images = post.coverImageUrl ? [{ url: post.coverImageUrl, alt: post.coverImageAlt || post.title }] : [];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: SITE_NAME,
      publishedTime: post.date,
      images,
    },
    twitter: {
      card: images.length ? "summary_large_image" : "summary",
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** Build Article + FAQPage + BreadcrumbList JSON-LD (uses stored schema if present). */
function buildJsonLd(post: Post): Record<string, unknown>[] {
  if (post.schemaJson) {
    try {
      const parsed = JSON.parse(post.schemaJson) as Record<string, unknown> | Record<string, unknown>[];
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      /* fall through to computed schema */
    }
  }
  const url = `${SITE_URL}/blogs/${post.slug}`;
  const graph: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.metaDescription || post.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      author: { "@type": "Organization", name: post.author },
      publisher: { "@type": "Organization", name: SITE_NAME },
      mainEntityOfPage: url,
      ...(post.coverImageUrl ? { image: post.coverImageUrl } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blogs` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];
  const faqs = faqsFromBody(post.body);
  if (faqs.length) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return graph;
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await resolvePost(slug);
  if (!post) notFound();

  // Table of contents from h2 headings.
  const toc = post.body
    .filter((b): b is { type: "h2"; text: string } => b.type === "h2")
    .map((b) => ({ text: b.text, id: slugifyHeading(b.text) }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={buildJsonLd(post)} />

      <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/blogs" className="hover:underline">Blog</Link>
      </nav>

      <article className="mt-6">
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={post.coverImageAlt || post.title}
            loading="lazy"
            className="mb-6 aspect-[16/9] w-full rounded-2xl object-cover"
          />
        ) : (
          <div className="text-5xl">{post.cover}</div>
        )}
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-3 text-sm text-slate-400">
          {formatDate(post.date)} · {post.author} · {post.readMins} min read
        </div>

        {toc.length >= 3 ? (
          <nav className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">On this page</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="text-brand-600 hover:underline">{t.text}</a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <PostBody body={post.body} />
      </article>

      <div className="mt-12 rounded-2xl bg-slate-900 p-8 text-center text-white">
        <h3 className="text-xl font-bold">Ready to make your own receipt?</h3>
        <p className="mt-2 text-slate-300">Preview it free — subscribe to download.</p>
        <Link
          href="/create"
          className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold hover:bg-brand-700"
        >
          Start creating
        </Link>
      </div>

      <div className="mt-10">
        <NewsletterForm />
      </div>
    </main>
  );
}

function slugifyHeading(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60);
}
