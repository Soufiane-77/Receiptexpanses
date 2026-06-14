"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser, logOut } from "@/lib/auth";
import Logo from "./Logo";

const NAV = [
  { href: "/create", label: "Create" },
  { href: "/receipts", label: "Receipt types" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blogs", label: "Blog" },
];

export default function SiteHeader() {
  const user = useCurrentUser();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
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
                className={active ? "font-medium text-brand-600" : "text-slate-600 hover:text-slate-900"}
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
                className="hidden rounded-md px-3 py-1.5 text-slate-600 hover:text-slate-900 sm:inline"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full bg-brand-50 px-3 py-1.5 font-medium text-brand-700"
                title={user.email}
              >
                {user.name.split(" ")[0]}
                {user.plan === "pro" ? " · Pro" : ""}
              </Link>
              <button
                onClick={() => logOut()}
                className="cursor-pointer rounded-md px-2 py-1.5 text-slate-400 transition-colors hover:text-slate-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-slate-600 transition-colors hover:text-slate-900"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-brand-600 px-3 py-1.5 font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
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
