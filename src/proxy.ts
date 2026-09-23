import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/session";

/**
 * Next.js 16 renamed the `middleware.js` convention to `proxy.js`; this file is
 * the "middleware protecting /admin/*" from the brief, under its current name.
 *
 * It only performs the *redirect*: an operator hitting a deep admin URL without
 * a session lands on the login page with a `from` parameter so they return to
 * where they were aiming. Authorization itself is re-checked inside every admin
 * page and route handler via `@/lib/admin/auth` — see the note there.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // The login screen and the session endpoint have to stay reachable, or there
  // is no way to ever obtain a session.
  if (pathname === "/admin/login" || pathname === "/api/admin/session") {
    return NextResponse.next();
  }

  const authenticated = await verifySessionToken(
    request.cookies.get(ADMIN_COOKIE)?.value
  );

  if (authenticated) return NextResponse.next();

  // API traffic gets a JSON 401 — redirecting an fetch() to an HTML login page
  // produces a confusing "Unexpected token <" on the client instead of a
  // readable error.
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
