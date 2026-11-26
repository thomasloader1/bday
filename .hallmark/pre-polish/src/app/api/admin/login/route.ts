import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Set HttpOnly cookie with password as value
    const response = NextResponse.json({
      success: true,
      redirect: "/admin/dashboard",
    });

    const cookieOptions: Parameters<typeof response.cookies.set>[0] = {
      name: "admin-session",
      value: password,
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict" as const,
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    };

    response.cookies.set(cookieOptions);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}