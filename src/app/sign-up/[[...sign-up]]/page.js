import { isClerkEnabled } from "@/lib/auth-mode";
import SignUpDisabled from "@/components/SignUpDisabled";

export const metadata = {
  title: "Sign Up",
};

export default async function Page() {
  if (!isClerkEnabled()) {
    return <SignUpDisabled />;
  }

  const { default: ClerkSignUp } = await import("@/components/ClerkSignUp");
  return <ClerkSignUp />;
}
