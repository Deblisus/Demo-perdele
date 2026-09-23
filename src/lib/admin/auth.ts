import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySessionToken } from "./session";

/**
 * Per-request admin guard.
 *
 * `proxy.ts` already bounces unauthenticated traffic away from `/admin/*`, but
 * the Next.js docs are explicit that proxy coverage is not an authorization
 * boundary: a matcher edit or a route move silently removes it, and Server
 * Functions are dispatched as POSTs to whatever route declared them. So every
 * admin page and every admin API route re-checks the session here. Proxy is the
 * redirect nicety; this is the actual lock.
 */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

/** Guard a Server Component. Sends the operator to the login page. */
export async function requireAdminPage(returnTo?: string): Promise<void> {
  if (await isAuthenticated()) return;
  const suffix = returnTo ? `?from=${encodeURIComponent(returnTo)}` : "";
  redirect(`/admin/login${suffix}`);
}

/**
 * Guard a Route Handler. Returns a 401 `Response` to bail out with, or `null`
 * when the caller may proceed:
 *
 *     const denied = await requireAdminApi();
 *     if (denied) return denied;
 */
export async function requireAdminApi(): Promise<Response | null> {
  if (await isAuthenticated()) return null;
  return Response.json(
    { error: "Not authenticated." },
    { status: 401, headers: { "cache-control": "no-store" } }
  );
}
