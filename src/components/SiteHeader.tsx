"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser, logOut } from "@/lib/auth";
import { PAYMENTS_ENABLED } from "@/lib/features";
import Logo from "./Logo";

const NAV = [
  { href: "/create", label: "Create" },
  { href: "/receipts", label: "Receipt types" },
  { href: "/guides", label: "Guides" },
  ...(PAYMENTS_ENABLED ? [{ href: "/pricing", label: "Pricing" }] : []),
  { href: "/blogs", label: "Blog" },
];

export default function SiteHeader() {
  const user = useCurrentUser();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group rounded-lg" aria-label="ReceiptExpenses home">
          <Logo size="md" />
        </Link>

        <nav className="hidden items-center gap-6 text-sm sm:flex">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={active ? "font-medium text-white" : "text-slate-400 transition-colors hover:text-white"}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden rounded-md px-3 py-1.5 text-slate-400 transition-colors hover:text-white sm:inline"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full bg-white/10 px-3 py-1.5 font-medium text-halo-200"
                title={user.email}
              >
                {user.name.split(" ")[0]}
                {PAYMENTS_ENABLED && user.plan === "pro" ? " · Pro" : ""}
              </Link>
              <button
                onClick={() => logOut()}
                className="cursor-pointer rounded-md px-2 py-1.5 text-slate-500 transition-colors hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-slate-400 transition-colors hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-white px-4 py-1.5 font-medium text-ink transition-colors hover:bg-halo-200"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
