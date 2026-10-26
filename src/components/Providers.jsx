"use client";

export default function Providers({ children, clerkEnabled = false }) {
  if (!clerkEnabled) {
    return children;
  }

  // Lazy require so Clerk is not bundled into public pages when disabled
  const { ClerkProvider } = require("@clerk/nextjs");
  return <ClerkProvider>{children}</ClerkProvider>;
}
