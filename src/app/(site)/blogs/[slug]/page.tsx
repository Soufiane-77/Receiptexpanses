import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "@/lib/blog";
import NewsletterForm from "@/components/NewsletterForm";
import JsonLd from "@/components/JsonLd";
import { CmsPostView } from "@/components/CmsPosts";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

// Statically render the known posts; render unknown slugs on demand so that
// browser-published CMS posts (client-side) can resolve via the CMS fallback.
export const dynamicParams = true;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found · ReceiptExpenses" };
  return {
    title: `${post.title} · ReceiptExpenses`,
    description: post.excerpt,
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  // Unknown to the static set → try a browser-published CMS post (client-side).
  if (!post) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/blogs" className="text-sm text-brand-600 hover:underline">
          ← All posts
        </Link>
        <CmsPostView slug={slug} />
        <div className="mt-10">
          <NewsletterForm />
        </div>
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${SITE_URL}/blogs/${post.slug}`,
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Link href="/blogs" className="text-sm text-brand-600 hover:underline">
        ← All posts
      </Link>

      <article className="mt-6">
        <div className="text-5xl">{post.cover}</div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-3 text-sm text-slate-400">
          {formatDate(post.date)} · {post.author} · {post.readMins} min read
        </div>

        <div className="mt-8 flex flex-col gap-4 leading-relaxed text-slate-700">
          {post.body.map((block, i) => {
            if (block.type === "h2") {
              return (
                <h2 key={i} className="mt-4 text-xl font-bold text-slate-900">
                  {block.text}
                </h2>
              );
            }
            if (block.type === "ul") {
              return (
                <ul key={i} className="ml-5 flex list-disc flex-col gap-1">
                  {block.items.map((it, j) => (
                    <li key={j}>{it}</li>
                  ))}
                </ul>
              );
            }
            return <p key={i}>{block.text}</p>;
          })}
        </div>
      </article>

      <div className="mt-12 rounded-2xl bg-slate-900 p-8 text-center text-white">
        <h3 className="text-xl font-bold">Ready to make your own receipt?</h3>
        <p className="mt-2 text-slate-300">It's free and takes less than a minute.</p>
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
