import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSecureRequest, SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Clear the admin session cookie
    const response = NextResponse.json({
      success: true,
      redirect: "/",
    });

    response.cookies.set({
      name: SESSION_COOKIE,
      value: "",
      httpOnly: true,
      secure: isSecureRequest(request),
      sameSite: "strict" as const,
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}