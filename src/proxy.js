/**
 * Legacy filename from upstream. Next.js 15 uses src/middleware.js.
 * Kept so upgrades that look for proxy.js still resolve.
 */
export { default, config } from "./middleware";
