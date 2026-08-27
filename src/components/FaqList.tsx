import type { Faq } from "@/lib/seo";

/**
 * Accessible FAQ accordion using native <details>/<summary>.
 * `dark` renders the variant used on the near-black marketing sections.
 */
export default function FaqList({ faqs, dark = false }: { faqs: Faq[]; dark?: boolean }) {
  const wrap = dark
    ? "divide-y divide-white/[0.07] rounded-2xl border border-white/[0.08] bg-ink-800"
    : "divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white";
  const question = dark ? "text-white" : "text-slate-900";
  const marker = dark ? "text-slate-500" : "text-slate-400";
  const answer = dark ? "text-slate-400" : "text-slate-600";

  return (
    <div className={wrap}>
      {faqs.map((f) => (
        <details key={f.q} className="group p-5">
          <summary
            className={`flex cursor-pointer list-none items-center justify-between font-medium ${question}`}
          >
            {f.q}
            <span
              className={`ml-4 text-xl leading-none transition-transform group-open:rotate-45 ${marker}`}
            >
              +
            </span>
          </summary>
          <p className={`mt-2 text-sm leading-relaxed ${answer}`}>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
