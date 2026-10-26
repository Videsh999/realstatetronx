import { NextResponse } from "next/server";
import {
  DEMO_ADMIN_COOKIE,
  getDemoAdminPassword,
  isClerkEnabled,
} from "@/lib/auth-mode";

export async function POST(request) {
  if (isClerkEnabled()) {
    return NextResponse.json(
      { success: false, message: "Clerk auth is enabled. Use /sign-in." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const password = body?.password;

  if (!password || password !== getDemoAdminPassword()) {
    return NextResponse.json(
      { success: false, message: "Invalid password" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(DEMO_ADMIN_COOKIE, getDemoAdminPassword(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(DEMO_ADMIN_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
