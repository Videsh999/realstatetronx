import { NextResponse } from "next/server";
import {
  DEMO_ADMIN_COOKIE,
  getDemoAdminPassword,
  isClerkEnabled,
} from "@/lib/auth-mode";

const isAdminPath = (pathname) =>
  pathname === "/admin" || pathname.startsWith("/admin/");

export default async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (!isAdminPath(pathname)) {
    return NextResponse.next();
  }

  if (isClerkEnabled()) {
    const { clerkMiddleware, createRouteMatcher, clerkClient } = await import(
      "@clerk/nextjs/server"
    );

    const run = clerkMiddleware(async (auth, request) => {
      const authObj = await auth();
      if (!authObj.userId) {
        return authObj.redirectToSignIn();
      }

      let role =
        authObj.sessionClaims?.metadata?.role ||
        authObj.sessionClaims?.publicMetadata?.role;

      if (!role) {
        try {
          const client = await clerkClient();
          const user = await client.users.getUser(authObj.userId);
          role = user.publicMetadata?.role;
        } catch (error) {
          console.error("Error fetching user metadata from Clerk:", error);
        }
      }

      if (role !== "admin") {
        return NextResponse.redirect(new URL("/access-denied", request.url));
      }
    });

    return run(req, {});
  }

  const session = req.cookies.get(DEMO_ADMIN_COOKIE)?.value;
  if (session && session === getDemoAdminPassword()) {
    return NextResponse.next();
  }

  const signIn = new URL("/sign-in", req.url);
  signIn.searchParams.set("redirect_url", pathname);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/admin/:path*"],
};
