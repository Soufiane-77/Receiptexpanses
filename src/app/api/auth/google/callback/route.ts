import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/server/db";
import {
  OAUTH_STATE_COOKIE,
  callbackUrl,
  exchangeCode,
  fetchProfile,
  googleConfig,
} from "@/lib/server/oauth";
import { findOrCreateGoogleUser } from "@/lib/server/users";
import { createSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

// Google redirects back here with ?code & ?state. Validate, exchange the code,
// resolve (or create) the local account, open a session, then return the user
// to where they started.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const fail = (code: string) => NextResponse.redirect(new URL(`/login?error=${code}`, origin));

  const oauthError = url.searchParams.get("error");
  if (oauthError) return fail("google_denied");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return fail("google_failed");

  // Validate CSRF state from the httpOnly cookie and recover the return path.
  const jar = await cookies();
  const stored = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.delete(OAUTH_STATE_COOKIE);
  if (!stored) return fail("google_failed");
  const [savedState, nextEnc] = stored.split("|");
  if (!savedState || savedState !== state) return fail("google_failed");
  const next = nextEnc ? decodeURIComponent(nextEnc) : "/dashboard";

  const cfg = await googleConfig();
  if (!cfg) return fail("google_unavailable");

  const env = await getEnv();
  const redirectUri = callbackUrl(req, env.APP_URL);

  const accessToken = await exchangeCode({ code, ...cfg, redirectUri });
  if (!accessToken) return fail("google_failed");

  const profile = await fetchProfile(accessToken);
  if (!profile || !profile.email) return fail("google_failed");

  const user = await findOrCreateGoogleUser(profile);
  await createSession(user.id);

  // Only allow local redirects to avoid an open-redirect via the `next` param.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return NextResponse.redirect(new URL(safeNext, origin));
}
