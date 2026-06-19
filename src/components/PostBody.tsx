import Link from "next/link";
import type { ReactNode } from "react";
import type { Block } from "@/lib/blog";

function headingId(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60);
}

/**
 * Render inline markdown: `[text](/path)` links (internal via <Link>, external
 * via <a>) and `**bold**`. Plain text otherwise. Keeps the block model simple
 * while supporting contextual internal links inside paragraphs and lists.
 */
function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      const href = m[2];
      nodes.push(
        href.startsWith("/") ? (
          <Link key={k++} href={href} className="text-brand-600 hover:underline">{m[1]}</Link>
        ) : (
          <a key={k++} href={href} rel="nofollow noopener" className="text-brand-600 hover:underline">{m[1]}</a>
        )
      );
    } else if (m[3]) {
      nodes.push(<strong key={k++}>{m[3]}</strong>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/**
 * Server-rendered renderer for a post body. Handles the full Block union:
 * headings (with anchor ids for the TOC), lists, tables, images, FAQ, and the
 * styled CTA block. No client JS — crawlers and AI engines see everything.
 */
export default function PostBody({ body }: { body: Block[] }) {
  return (
    <div className="mt-8 flex flex-col gap-4 leading-relaxed text-slate-700">
      {body.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} id={headingId(block.text)} className="mt-6 scroll-mt-24 text-2xl font-bold text-slate-900">
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} id={headingId(block.text)} className="mt-4 scroll-mt-24 text-lg font-semibold text-slate-900">
                {block.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="ml-5 flex list-disc flex-col gap-1">
                {block.items.map((it, j) => <li key={j}>{inline(it)}</li>)}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="ml-5 flex list-decimal flex-col gap-1">
                {block.items.map((it, j) => <li key={j}>{inline(it)}</li>)}
              </ol>
            );
          case "table":
            return (
              <div key={i} className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-300 text-left">
                      {block.headers.map((h, j) => (
                        <th key={j} className="px-3 py-2 font-semibold text-slate-900">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r} className="border-b border-slate-100">
                        {row.map((cell, c) => <td key={c} className="px-3 py-2 align-top">{inline(cell)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "image":
            return (
              <figure key={i} className="my-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.src} alt={block.alt} loading="lazy" className="w-full rounded-xl object-cover" />
                {block.caption ? (
                  <figcaption className="mt-2 text-center text-xs text-slate-400">{block.caption}</figcaption>
                ) : null}
              </figure>
            );
          case "cta":
            return (
              <div
                key={i}
                className="my-4 flex flex-col items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="font-medium text-slate-800">{block.text}</p>
                <Link
                  href={block.url}
                  className="shrink-0 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  {block.label}
                </Link>
              </div>
            );
          case "faq":
            return (
              <div key={i} className="mt-4 flex flex-col gap-4">
                {block.items.map((f, j) => (
                  <div key={j}>
                    <h3 id={headingId(f.q)} className="scroll-mt-24 text-lg font-semibold text-slate-900">{f.q}</h3>
                    <p className="mt-1">{inline(f.a)}</p>
                  </div>
                ))}
              </div>
            );
          default:
            return <p key={i}>{inline((block as { text: string }).text)}</p>;
        }
      })}
    </div>
  );
}
