"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  blocksToText,
  listPosts,
  removePost,
  setStatus,
  textToBlocks,
  upsertPost,
  type StoredPost,
} from "@/lib/cms";
import { Field, Section, inputCls } from "@/components/fields";
import { Button } from "@/components/Button";
import { PlusIcon, TrashIcon } from "@/components/icons";

type Draft = {
  id?: string;
  title: string;
  excerpt: string;
  author: string;
  cover: string;
  bodyText: string;
};

const EMPTY: Draft = {
  title: "",
  excerpt: "",
  author: "ReceiptExpenses Team",
  cover: "📝",
  bodyText: "## Section heading\n\nWrite a paragraph here.\n\n- A bullet point\n- Another point",
};

export default function AdminBlog() {
  const [posts, setPosts] = useState<StoredPost[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);

  const refresh = () => setPosts(listPosts());
  useEffect(refresh, []);

  const save = (status: "draft" | "published") => {
    if (!draft || !draft.title.trim()) {
      window.alert("Please give the post a title.");
      return;
    }
    upsertPost({
      id: draft.id,
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim() || draft.title.trim(),
      author: draft.author.trim() || "ReceiptExpenses Team",
      cover: draft.cover || "📝",
      body: textToBlocks(draft.bodyText),
      status,
    });
    setDraft(null);
    refresh();
  };

  const edit = (p: StoredPost) =>
    setDraft({
      id: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      author: p.author,
      cover: p.cover,
      bodyText: blocksToText(p.body),
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Posts you publish here are saved in <strong>this browser</strong> and rendered client-side.
        They aren’t statically generated or in the build-time sitemap, so other visitors and search
        engines won’t see them. For world-visible posts, add them to{" "}
        <code className="rounded bg-slate-100 px-1">src/lib/blog.ts</code> (a real CMS/backend would
        remove this limitation).
      </div>

      {!draft ? (
        <Button onClick={() => setDraft({ ...EMPTY })} className="self-start">
          <PlusIcon className="h-4 w-4" />
          New post
        </Button>
      ) : (
        <Section title={draft.id ? "Edit post" : "New post"}>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field label="Title">
              <input
                className={inputCls}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </Field>
            <Field label="Cover">
              <input
                className={`${inputCls} w-20 text-center`}
                value={draft.cover}
                onChange={(e) => setDraft({ ...draft, cover: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Excerpt">
            <input
              className={inputCls}
              value={draft.excerpt}
              onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
            />
          </Field>
          <Field label="Author">
            <input
              className={inputCls}
              value={draft.author}
              onChange={(e) => setDraft({ ...draft, author: e.target.value })}
            />
          </Field>
          <Field label="Body" hint="Use `## ` for headings and `- ` for bullets. Blank line = new paragraph.">
            <textarea
              className={`${inputCls} min-h-[220px] font-mono text-xs`}
              value={draft.bodyText}
              onChange={(e) => setDraft({ ...draft, bodyText: e.target.value })}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => save("published")}>Publish</Button>
            <Button variant="secondary" onClick={() => save("draft")}>
              Save draft
            </Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </Section>
      )}

      <Section title={`Posts (${posts.length})`}>
        {posts.length === 0 ? (
          <p className="text-sm text-slate-500">No posts yet. Create your first one above.</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {posts.map((p) => (
              <div key={p.slug} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.cover}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{p.title}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          p.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {p.status}
                      </span>
                      {p.source === "auto" ? (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-700">
                          auto
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-slate-400">
                      /blogs/{p.slug} · {p.readMins} min
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.status === "published" ? (
                    <Link
                      href={`/blogs/${p.slug}`}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      View
                    </Link>
                  ) : null}
                  <Button size="sm" variant="secondary" onClick={() => edit(p)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setStatus(p.slug, p.status === "published" ? "draft" : "published");
                      refresh();
                    }}
                  >
                    {p.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (window.confirm("Delete this post?")) {
                        removePost(p.slug);
                        refresh();
                      }
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
