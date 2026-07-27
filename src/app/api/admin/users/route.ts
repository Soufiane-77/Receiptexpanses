import { NextResponse } from "next/server";
import { getEnv } from "@/lib/server/db";
import { isAuthorized } from "@/lib/server/adminToken";

export const dynamic = "force-dynamic";

type SupabaseUser = {
  id: string;
  email?: string | null;
  created_at?: string;
  last_sign_in_at?: string | null;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  app_metadata?: { provider?: string; providers?: string[] };
  user_metadata?: Record<string, unknown>;
};

/**
 * Admin readout of registered users, sourced from Supabase Auth (the system of
 * record since the auth migration — the legacy D1 `users` table is no longer
 * written to).
 *
 * Requires the Supabase service_role key as a Worker secret:
 *   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
 * That key is admin-level and is used ONLY here, server-side — it is never sent
 * to the browser. The route itself is gated by BLOG_ADMIN_TOKEN like the other
 * admin endpoints, because the client admin panel is only a soft gate.
 *
 * GET /api/admin/users?token=…&page=1&perPage=100
 */
export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const env = await getEnv();
  const url = env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      {
        error:
          "User listing needs the Supabase service_role key. Set it with: npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY",
      },
      { status: 503 }
    );
  }

  const q = new URL(req.url).searchParams;
  const page = clamp(Number(q.get("page")) || 1, 1, 1000);
  const perPage = clamp(Number(q.get("perPage")) || 100, 1, 1000);

  try {
    const res = await fetch(
      `${url}/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
      {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      }
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: `Supabase admin API returned ${res.status}.`, detail: await res.text() },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { users?: SupabaseUser[]; aud?: string };
    const raw = data.users ?? [];

    const users = raw.map((u) => {
      const meta = u.user_metadata ?? {};
      const name =
        (typeof meta.name === "string" && meta.name) ||
        (typeof meta.full_name === "string" && meta.full_name) ||
        "";
      return {
        id: u.id,
        email: u.email ?? null,
        name: String(name),
        provider: u.app_metadata?.provider ?? "email",
        providers: u.app_metadata?.providers ?? [],
        createdAt: u.created_at ?? null,
        lastSignInAt: u.last_sign_in_at ?? null,
        confirmed: Boolean(u.email_confirmed_at ?? u.confirmed_at),
      };
    });

    // Signup trend + provider split, computed from this page of users.
    const byDay = new Map<string, number>();
    const byProvider = new Map<string, number>();
    let confirmed = 0;
    let last7 = 0;
    const weekAgo = Date.now() - 7 * 86_400_000;
    for (const u of users) {
      if (u.createdAt) {
        const day = u.createdAt.slice(0, 10);
        byDay.set(day, (byDay.get(day) ?? 0) + 1);
        if (Date.parse(u.createdAt) >= weekAgo) last7++;
      }
      byProvider.set(u.provider, (byProvider.get(u.provider) ?? 0) + 1);
      if (u.confirmed) confirmed++;
    }

    return NextResponse.json({
      users,
      page,
      perPage,
      count: users.length,
      hasMore: users.length === perPage,
      stats: {
        confirmed,
        unconfirmed: users.length - confirmed,
        last7,
        byProvider: [...byProvider.entries()].map(([provider, count]) => ({ provider, count })),
        byDay: [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([day, count]) => ({ day, count })),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Could not reach Supabase.", detail: String(e) }, { status: 502 });
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, Math.floor(n)));
}
