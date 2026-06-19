import { SITE_URL } from "@/lib/seo";
import { ensureIndexNowKey, loadSettings, type BlogSettings } from "./blogSettings";
import { setIndexStatus } from "./blogStore";

/**
 * Search-engine submission. We are honest about what each path actually does:
 *
 *  - IndexNow  — instant push to Bing, Yandex, Naver, Seznam. Google does NOT
 *    support IndexNow. This is the real "submit on publish" path.
 *  - Sitemap   — the dynamic /sitemap.xml already lists every published post;
 *    Google's old sitemap-ping endpoint was retired in 2023, so discovery for
 *    Google relies on the sitemap + internal links + Search Console (no ping).
 *  - Google Indexing API — default OFF. Google restricts it to JobPosting /
 *    BroadcastEvent pages and may reject other use; only called when the admin
 *    explicitly enables the toggle AND provides a service-account JSON.
 *
 * "Submitted for indexing" != "indexed" — engines still decide on quality.
 */

export type EngineResult = { ok: boolean; status?: number; detail?: string; at: number };
export type IndexStatus = Record<string, EngineResult>;

const indexNowHost = new URL(SITE_URL).host;

export async function submitForIndexing(db: D1Database, slug: string): Promise<IndexStatus> {
  const settings = await loadSettings(db);
  const url = `${SITE_URL}/blogs/${slug}`;
  const result: IndexStatus = {};

  if (settings.enableIndexNow) {
    result.indexnow = await pushIndexNow(db, url);
    // IndexNow fans out to Bing/Yandex/Naver/Seznam from a single endpoint.
    result.bing = { ok: result.indexnow.ok, detail: "via IndexNow", at: Date.now() };
  }

  if (settings.enableGoogleIndexing) {
    result.google = await pushGoogle(settings, url);
  } else {
    result.google = { ok: false, detail: "disabled (use Search Console + sitemap)", at: Date.now() };
  }

  await setIndexStatus(db, slug, result);
  return result;
}

// --- IndexNow --------------------------------------------------------------

async function pushIndexNow(db: D1Database, url: string): Promise<EngineResult> {
  try {
    const key = await ensureIndexNowKey(db);
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: indexNowHost,
        key,
        keyLocation: `${SITE_URL}/api/indexnow`,
        urlList: [url],
      }),
    });
    // IndexNow returns 200 or 202 on success.
    return { ok: res.ok, status: res.status, at: Date.now() };
  } catch (e) {
    return { ok: false, detail: String((e as Error)?.message ?? e).slice(0, 200), at: Date.now() };
  }
}

// --- Google Indexing API (default off) -------------------------------------

async function pushGoogle(settings: BlogSettings, url: string): Promise<EngineResult> {
  // settings.enableGoogleIndexing is true here; we still need a service account.
  const saRaw = (settings as unknown as { google_sa_json?: string }).google_sa_json;
  if (!saRaw) return { ok: false, detail: "enabled but no service-account JSON set", at: Date.now() };
  try {
    const sa = JSON.parse(saRaw) as { client_email: string; private_key: string };
    const token = await googleAccessToken(sa);
    const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, type: "URL_UPDATED" }),
    });
    return { ok: res.ok, status: res.status, at: Date.now() };
  } catch (e) {
    return { ok: false, detail: String((e as Error)?.message ?? e).slice(0, 200), at: Date.now() };
  }
}

/** Mint a short-lived OAuth token from a Google service account (RS256 JWT). */
async function googleAccessToken(sa: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/indexing",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const signingInput = `${header}.${claims}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToBuffer(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput));
  const jwt = `${signingInput}.${b64urlBytes(new Uint8Array(sig))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = (await res.json()) as { access_token?: string; error_description?: string };
  if (!data.access_token) throw new Error(data.error_description || "token request failed");
  return data.access_token;
}

function b64url(s: string): string {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlBytes(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function pemToBuffer(pem: string): ArrayBuffer {
  const body = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const bin = atob(body);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}
