import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionSecret, SESSION_COOKIE, verifySessionToken } from "./session";

/**
 * Defence in depth for admin route handlers: the middleware already blocks
 * unauthenticated requests, and every handler checks again.
 * Returns a 401 response to send back, or null when the session is valid.
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const ok = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, getSessionSecret());
  return ok ? null : NextResponse.json({ error: "No autorizado" }, { status: 401 });
}
