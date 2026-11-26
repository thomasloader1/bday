import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionSecret, SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Paths under /admin and /api/admin that must stay reachable without a session.
const isPublicPath = (pathname: string) =>
  pathname === "/admin/login" ||
  pathname.startsWith("/api/admin/login") ||
  pathname.startsWith("/api/admin/logout");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const valid = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, getSessionSecret());
  if (valid) {
    return NextResponse.next();
  }

  // Admin APIs answer 401; admin pages send you to the login.
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL("/admin/login", request.url);
  url.searchParams.set("redirected", "1");
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
