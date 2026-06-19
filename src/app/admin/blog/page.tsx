"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isAuthed } from "@/lib/adminSettings";
import AutopilotBlog from "@/components/admin/AutopilotBlog";
import Logo from "@/components/Logo";

/**
 * Dedicated full-page Autopilot Blog console. Shares the same client-side soft
 * gate as /admin (the real protection is the server-side BLOG_ADMIN_TOKEN that
 * every /api/admin/blog call requires).
 */
export default function AdminBlogPage() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthed(isAuthed());
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">…</div>;
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-4 text-center">
        <h1 className="text-xl font-bold text-slate-900">Sign in required</h1>
        <p className="text-sm text-slate-500">Sign in from the admin dashboard, then return here.</p>
        <Link href="/admin" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Go to /admin
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="ReceiptExpenses home"><Logo size="sm" /></Link>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Autopilot Blog</span>
          </div>
          <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-900">← Admin</Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <AutopilotBlog />
      </div>
    </main>
  );
}
