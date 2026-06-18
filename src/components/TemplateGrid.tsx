"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, TEMPLATES, type TemplateCategory, type TemplateDef } from "@/templates/registry";
import { enabledTemplateDefs } from "@/lib/adminSettings";
import TemplateIcon from "./TemplateIcon";
import { templateName, templateDescription, templateLogo } from "@/lib/templateCustomize";
import { ArrowRightIcon } from "./icons";

type Filter = "All" | TemplateCategory;

export default function TemplateGrid() {
  // Start with the full registry for SSR/first paint, then narrow to the
  // admin-enabled subset once localStorage is available.
  const [templates, setTemplates] = useState<TemplateDef[]>(TEMPLATES);
  const [filter, setFilter] = useState<Filter>("All");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const enabled = enabledTemplateDefs();
    if (enabled.length > 0) setTemplates(enabled);
  }, []);

  const filters: Filter[] = useMemo(() => ["All", ...CATEGORIES], []);
  const visible = filter === "All" ? templates : templates.filter((t) => t.category === filter);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((t) => {
          const isBrand = !!t.brandColor;
          const name = mounted ? templateName(t.id, t.name) : t.name;
          const description = mounted ? templateDescription(t.id, t.description) : t.description;
          const logo = mounted ? templateLogo(t.id) : undefined;
          return (
            <Link
              key={t.id}
              href={`/create?template=${t.id}`}
              className="group flex cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              {/* Icon area — brand templates get their brand color background */}
              <div
                className={`relative mb-4 flex h-28 items-center justify-center rounded-xl transition-colors ${
                  isBrand
                    ? "text-white"
                    : "bg-gradient-to-br from-brand-50 to-slate-50 text-brand-600 group-hover:from-brand-100"
                }`}
                style={isBrand ? { backgroundColor: `${t.brandColor}18`, color: t.brandColor } : undefined}
              >
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo}
                    alt={`${name} logo`}
                    className="max-h-16 w-auto object-contain"
                  />
                ) : (
                  <TemplateIcon id={t.id} className="h-14 w-14" />
                )}

                {/* Brand badge */}
                {t.brandLabel ? (
                  <span
                    className="absolute top-2 right-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
                    style={{ backgroundColor: t.brandColor }}
                  >
                    {t.brandLabel}
                  </span>
                ) : null}
              </div>

              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {t.category}
              </span>
              <h3 className="mt-1 text-lg font-semibold text-slate-900 transition-colors group-hover:text-brand-600">
                {name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                Use this template
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
