"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Block } from "@/lib/blog";
import { getStoredPost, listPublished, type StoredPost } from "@/lib/cms";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** Renders a post body (shared block renderer). */
export function PostBlocks({ body }: { body: Block[] }) {
  return (
    <div className="mt-8 flex flex-col gap-4 leading-relaxed text-slate-700">
      {body.map((block, i) => {
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
  );
}

/** Published CMS posts shown beneath the static posts on /blogs. */
export function CmsPostList() {
  const [posts, setPosts] = useState<StoredPost[] | null>(null);
  useEffect(() => setPosts(listPublished()), []);

  if (!posts || posts.length === 0) return null;

  return (
    <div className="mt-6 flex flex-col gap-6">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Published from this browser
      </p>
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`/blogs/${post.slug}`}
          className="group flex gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-brand-300 hover:shadow-elevated"
        >
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-4xl">
            {post.cover}
          </div>
          <div>
            <div className="text-xs text-slate-400">
              {formatDate(post.date)} · {post.readMins} min read
              {post.source === "auto" ? " · auto" : ""}
            </div>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-brand-600">
              {post.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{post.excerpt}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

/** Client fallback for /blogs/[slug] when the slug isn't a static post. */
export function CmsPostView({ slug }: { slug: string }) {
  const [post, setPost] = useState<StoredPost | null | undefined>(undefined);
  useEffect(() => setPost(getStoredPost(slug) ?? null), [slug]);

  if (post === undefined) {
    return <div className="py-20 text-center text-slate-400">Loading…</div>;
  }

  if (!post || post.status !== "published") {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Post not found</h1>
        <p className="mt-2 text-slate-500">This post doesn’t exist or isn’t published.</p>
        <Link href="/blogs" className="mt-4 inline-block text-brand-600 hover:underline">
          ← All posts
        </Link>
      </div>
    );
  }

  return (
    <article className="mt-6">
      <div className="text-5xl">{post.cover}</div>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {post.title}
      </h1>
      <div className="mt-3 text-sm text-slate-400">
        {formatDate(post.date)} · {post.author} · {post.readMins} min read
      </div>
      <PostBlocks body={post.body} />
    </article>
  );
}
