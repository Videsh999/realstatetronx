import { Suspense } from "react";
import { isClerkEnabled } from "@/lib/auth-mode";
import DemoSignIn from "@/components/DemoSignIn";

export const metadata = {
  title: "Sign In",
  description: "Sign in to the Tronx admin portal.",
};

export default async function Page() {
  if (!isClerkEnabled()) {
    return (
      <Suspense fallback={null}>
        <DemoSignIn />
      </Suspense>
    );
  }

  const { default: ClerkSignIn } = await import("@/components/ClerkSignIn");
  return <ClerkSignIn />;
}
