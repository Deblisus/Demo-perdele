import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  createSessionToken,
  isAdminConfigured,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/admin/session";

/**
 * Login / logout for the admin panel.
 *
 * POST   { password }  → sets the session cookie
 * DELETE               → clears it
 */

/**
 * A crude in-memory throttle. One shared password with no lockout is trivially
 * brute-forceable, and this at least turns an online guessing attack into a
 * multi-day affair. It is per-process and resets on deploy — good enough for
 * the single-instance v1, and the first thing to replace when the panel moves
 * behind a real auth system.
 */
const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function throttleKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "local";
}

function isThrottled(key: string): boolean {
  const record = attempts.get(key);
  if (!record) return false;
  if (Date.now() - record.firstAt > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string): void {
  const record = attempts.get(key);
  if (!record || Date.now() - record.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: Date.now() });
    return;
  }
  record.count += 1;
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return Response.json(
      { error: "ADMIN_PASSWORD is not set on the server." },
      { status: 500 }
    );
  }

  const key = throttleKey(request);
  if (isThrottled(key)) {
    return Response.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }

  if (typeof password !== "string" || password.length === 0) {
    return Response.json({ error: "Enter the admin password." }, { status: 400 });
  }

  if (!verifyPassword(password)) {
    recordFailure(key);
    return Response.json({ error: "Incorrect password." }, { status: 401 });
  }

  attempts.delete(key);

  const { token, maxAge } = await createSessionToken();
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, sessionCookieOptions(maxAge));

  return Response.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "", sessionCookieOptions(0));
  return Response.json({ ok: true });
}
