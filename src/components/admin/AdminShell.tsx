"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { XIcon } from "@/components/icons";

export type NavItem<T extends string> = {
  id: T;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  badge?: string;
};

/**
 * Shopify-admin style app frame: dark top bar, light neutral sidebar with an
 * active "pill", and a neutral canvas for the content column.
 *
 * Responsive: the sidebar is permanent from lg up and becomes an overlay drawer
 * below it (Material adaptive-navigation guidance — sidebar ≥1024px).
 */
export default function AdminShell<T extends string>({
  nav,
  current,
  onNavigate,
  onSignOut,
  children,
}: {
  nav: NavItem<T>[];
  current: T;
  onNavigate: (id: T) => void;
  onSignOut: () => void;
  children: ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);

  // Close the drawer on Escape (modal escape-route rule).
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  const go = (id: T) => {
    onNavigate(id);
    setDrawer(false);
  };

  return (
    <div className="min-h-screen bg-[#f1f1f1]">
      {/* ------------------------------ Top bar ------------------------------ */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 bg-[#1a1a1a] px-3 text-white sm:px-4">
        <button
          type="button"
          onClick={() => setDrawer(true)}
          aria-label="Open navigation menu"
          aria-expanded={drawer}
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 lg:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-[13px] font-bold text-white">
            R
          </span>
          <span className="hidden text-sm font-semibold sm:inline">ReceiptExpenses</span>
        </Link>

        <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white/70">
          Admin
        </span>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/"
            className="hidden rounded-lg px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:inline-block"
          >
            View store
          </Link>
          <button
            type="button"
            onClick={onSignOut}
            className="cursor-pointer rounded-lg px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px]">
        {/* ------------------------------ Sidebar ---------------------------- */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-[#e1e1e1] px-3 py-4 lg:block">
          <SideNav nav={nav} current={current} onNavigate={go} />
        </aside>

        {/* Mobile drawer */}
        {drawer ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setDrawer(false)}
              aria-hidden
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[#f1f1f1] shadow-xl"
            >
              <div className="flex h-14 items-center justify-between border-b border-[#e1e1e1] px-4">
                <span className="text-sm font-semibold text-[#303030]">Menu</span>
                <button
                  type="button"
                  onClick={() => setDrawer(false)}
                  aria-label="Close navigation menu"
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-[#616161] transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-4">
                <SideNav nav={nav} current={current} onNavigate={go} />
              </div>
            </div>
          </div>
        ) : null}

        {/* ------------------------------ Content ---------------------------- */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SideNav<T extends string>({
  nav,
  current,
  onNavigate,
}: {
  nav: NavItem<T>[];
  current: T;
  onNavigate: (id: T) => void;
}) {
  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-0.5">
      {nav.map((item) => {
        const active = item.id === current;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            aria-current={active ? "page" : undefined}
            className={`group flex min-h-[40px] w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              active
                ? "bg-white font-semibold text-[#303030] shadow-[0_1px_0_0_rgba(0,0,0,0.06)]"
                : "font-medium text-[#4a4a4a] hover:bg-black/[0.06]"
            }`}
          >
            <item.Icon
              className={`h-[18px] w-[18px] shrink-0 ${
                active ? "text-brand-600" : "text-[#6b6b6b] group-hover:text-[#303030]"
              }`}
            />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge ? (
              <span className="shrink-0 rounded-full bg-[#e3e3e3] px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-[#4a4a4a]">
                {item.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
