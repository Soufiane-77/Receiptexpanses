import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/server/db";
import {
  OAUTH_STATE_COOKIE,
  buildAuthUrl,
  callbackUrl,
  googleConfig,
  randomState,
} from "@/lib/server/oauth";

export const dynamic = "force-dynamic";

// Start of the Google sign-in flow: stash CSRF state + return path, then
// redirect the browser to Google's consent screen.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/dashboard";

  const cfg = await googleConfig();
  if (!cfg) {
    return NextResponse.redirect(new URL("/login?error=google_unavailable", url.origin));
  }

  const env = await getEnv();
  const redirectUri = callbackUrl(req, env.APP_URL);
  const state = randomState();

  const jar = await cookies();
  jar.set(OAUTH_STATE_COOKIE, `${state}|${encodeURIComponent(next)}`, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return NextResponse.redirect(buildAuthUrl(cfg.clientId, redirectUri, state));
}
