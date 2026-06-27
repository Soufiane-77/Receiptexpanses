// Google OAuth 2.0 (Authorization Code flow) helpers.
//
// Confidential client: we hold GOOGLE_CLIENT_SECRET, so CSRF is covered by an
// opaque `state` value (round-tripped via an httpOnly cookie) rather than PKCE.
// Server-only — call from the /api/auth/google route handlers.

import { getEnv } from "./db";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://openidconnect.googleapis.com/v1/userinfo";

/**
 * httpOnly cookie that round-trips the CSRF `state` + return path between the
 * start and callback routes. Holds `${state}|${encodeURIComponent(next)}`.
 * Lives here (not in the route file) because App Router route modules may only
 * export request handlers + a fixed set of config keys.
 */
export const OAUTH_STATE_COOKIE = "g_oauth";

export type GoogleProfile = {
  /** Stable Google account id ("sub" claim). */
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
};

/** Resolve the Google client credentials, or null when not configured. */
export async function googleConfig(): Promise<{ clientId: string; clientSecret: string } | null> {
  const env = await getEnv();
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return null;
  return { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET };
}

/**
 * Absolute callback URL for this request's origin. Must exactly match a URI
 * registered in the Google Cloud console. APP_URL (if set) wins so production
 * always uses the canonical domain even behind proxies.
 */
export function callbackUrl(req: Request, appUrl?: string): string {
  const origin = appUrl ?? new URL(req.url).origin;
  return `${origin}/api/auth/google/callback`;
}

/** Build the Google consent-screen URL to redirect the user to. */
export function buildAuthUrl(clientId: string, redirectUri: string, state: string): string {
  const u = new URL(GOOGLE_AUTH);
  u.searchParams.set("client_id", clientId);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "openid email profile");
  u.searchParams.set("state", state);
  u.searchParams.set("access_type", "online");
  u.searchParams.set("prompt", "select_account");
  return u.toString();
}

/** Exchange an authorization code for an access token. Returns null on failure. */
export async function exchangeCode(opts: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<string | null> {
  const res = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: opts.code,
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
      redirect_uri: opts.redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

/** Fetch the user's profile from the access token. Returns null on failure. */
export async function fetchProfile(accessToken: string): Promise<GoogleProfile | null> {
  const res = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const d = (await res.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
  if (!d.sub || !d.email) return null;
  const email = d.email.trim().toLowerCase();
  return {
    sub: d.sub,
    email,
    emailVerified: d.email_verified ?? false,
    name: (d.name ?? email.split("@")[0] ?? "").trim(),
    picture: d.picture,
  };
}

/** Opaque, URL-safe random value for the OAuth `state` parameter. */
export function randomState(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
