import type { Faq } from "@/lib/seo";

/** Accessible FAQ accordion using native <details>/<summary>. */
export default function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {faqs.map((f) => (
        <details key={f.q} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-slate-900">
            {f.q}
            <span className="ml-4 text-xl leading-none text-slate-400 transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
