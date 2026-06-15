// Password hashing using PBKDF2 via the Web Crypto API. Available in the
// Cloudflare Workers runtime and in Node 20+ — no native bcrypt dependency.

const ITERATIONS = 100_000;
const KEY_BITS = 256;
const SALT_BYTES = 16;

function bufToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    KEY_BITS
  );
}

/** Hash a password; returns base64 hash + base64 salt to store. */
export async function hashPassword(
  password: string
): Promise<{ hash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const derived = await deriveKey(password, salt);
  return { hash: bufToBase64(derived), salt: bufToBase64(salt.buffer) };
}

/** Constant-time-ish comparison of two base64 strings. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Verify a password against a stored base64 hash + salt. */
export async function verifyPassword(
  password: string,
  hashB64: string,
  saltB64: string
): Promise<boolean> {
  const salt = base64ToBytes(saltB64);
  const derived = await deriveKey(password, salt);
  return safeEqual(bufToBase64(derived), hashB64);
}
