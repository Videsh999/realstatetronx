"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function ClerkSignUp() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F7F8F5]">
      <SignUp
        fallbackRedirectUrl="/admin"
        appearance={{
          elements: {
            formButtonPrimary: "bg-[#1B4332] hover:bg-[#133024] text-sm",
            card: "shadow-xl border border-gray-100 rounded-[32px] p-4",
            headerTitle: "font-playfair text-2xl font-bold",
          },
        }}
      />
    </div>
  );
}

export function SignUpDisabled() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F7F8F5]">
      <div className="text-center max-w-md">
        <h1 className="font-playfair text-3xl font-bold text-[#1B4332] mb-3">
          Sign-up unavailable
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Demo mode uses a shared admin password. Use the sign-in page instead.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex rounded-full bg-[#1B4332] text-white px-6 py-3 text-sm font-semibold"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}
