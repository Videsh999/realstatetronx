/**
 * Auth mode helpers — Clerk when configured, demo admin otherwise.
 */
export function isClerkEnabled() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY &&
      !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("pk_test_placeholder"),
  );
}

export const DEMO_ADMIN_COOKIE = "tronx_admin_session";

export function getDemoAdminPassword() {
  return process.env.ADMIN_PASSWORD || "tronx-admin-2026";
}
