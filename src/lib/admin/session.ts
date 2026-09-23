/**
 * Admin session tokens — v1.
 *
 * A single shared password (`ADMIN_PASSWORD`) gates the panel, and a successful
 * login mints a short-lived HMAC-signed token stored in an httpOnly cookie.
 * There are no user records, no roles and no refresh flow; this is deliberately
 * the smallest thing that can hold the door shut until a real auth system lands.
 *
 * Everything here uses Web Crypto rather than `node:crypto` so the same module
 * can be imported from `proxy.ts`, a Route Handler and a Server Component
 * without caring which runtime it ends up on.
 */

export const ADMIN_COOKIE = "perdele_admin";

/** Eight hours — one working day at the shop, then log in again. */
const SESSION_TTL_SECONDS = 60 * 60 * 8;

const encoder = new TextEncoder();

function getPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD is not set. Add it to .env before using /admin."
    );
  }
  return password;
}

/**
 * The signing key. `ADMIN_SESSION_SECRET` is the right thing to set, because
 * rotating the password then does not have to invalidate the secret and vice
 * versa. When it is absent we derive a key from the password so a fresh install
 * works with one environment variable — at the cost of logging everyone out
 * whenever the password changes, which is the correct behaviour anyway.
 */
function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || `derived:${getPassword()}`;
}

/** Is the admin panel configured at all? Used to render a useful error page. */
export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

// ── Encoding helpers ─────────────────────────────────────────────────

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Constant-time string comparison. A plain `===` on the password leaks its
 * length and prefix through timing; with a single shared secret and no rate
 * limiting that is the one side channel actually worth closing.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  // Compare a fixed number of bytes regardless of input length, then fold the
  // length check into the same result so an early return never happens.
  const length = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < length; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  return toBase64Url(new Uint8Array(signature));
}

// ── Public API ───────────────────────────────────────────────────────

/** Check a submitted password against `ADMIN_PASSWORD`. */
export function verifyPassword(candidate: string): boolean {
  return timingSafeEqual(candidate, getPassword());
}

/** Mint a signed session token. Returns the token and its max-age in seconds. */
export async function createSessionToken(): Promise<{
  token: string;
  maxAge: number;
}> {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = toBase64Url(encoder.encode(JSON.stringify({ exp: expiresAt })));
  const signature = await sign(payload);
  return { token: `${payload}.${signature}`, maxAge: SESSION_TTL_SECONDS };
}

/**
 * Verify a session token. Returns false for anything malformed, tampered with
 * or expired — the caller never needs to distinguish between those cases.
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  let expected: string;
  try {
    expected = await sign(payload);
  } catch {
    // ADMIN_PASSWORD missing — treat every session as invalid rather than
    // throwing inside proxy, which would take down the whole route tree.
    return false;
  }

  if (!timingSafeEqual(signature, expected)) return false;

  try {
    const decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    return (
      typeof decoded?.exp === "number" && decoded.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

/** Cookie attributes shared by the login and logout handlers. */
export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
