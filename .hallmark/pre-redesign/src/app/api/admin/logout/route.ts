import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Clear the admin session cookie
    const response = NextResponse.json({
      success: true,
      redirect: "/",
    });

    response.cookies.set({
      name: "admin-session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
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