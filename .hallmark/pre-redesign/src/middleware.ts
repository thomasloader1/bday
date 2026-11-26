import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Public paths that don't need auth check
const isPublicPath = (pathname: string) => {
  return (
    pathname === "/admin/login" ||
    pathname === "/admin" ||
    pathname.startsWith("/api/admin/login") ||
    pathname.startsWith("/api/admin/logout") ||
    pathname === "/"
  );
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Protect all /admin/* routes
  if (pathname.startsWith("/admin")) {
    const cookie = request.cookies.get("admin-session");

    if (!cookie || cookie.value !== ADMIN_PASSWORD) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("redirected", "1");
      return NextResponse.redirect(url, 307);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};