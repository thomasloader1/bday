import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSessionToken, getSessionSecret, isSecureRequest, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/session";

export const runtime = "nodejs";

const encoder = new TextEncoder();

const sameSecret = (a: string, b: string): boolean => {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left[i] ^ right[i];
  }
  return diff === 0;
};

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD is not set");
    return NextResponse.json({ error: "El admin no está configurado" }, { status: 500 });
  }

  let password: unknown;
  try {
    ({ password } = (await request.json()) as { password?: unknown });
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  if (!sameSecret(password, adminPassword)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // The cookie carries a signed, expiring token, never the password.
  const response = NextResponse.json({ success: true, redirect: "/admin/dashboard" });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: await createSessionToken(getSessionSecret()),
    httpOnly: true,
    secure: isSecureRequest(request),
    sameSite: "strict",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
  return response;
}
