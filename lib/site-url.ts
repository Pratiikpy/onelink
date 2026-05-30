/**
 * Canonical public origin for absolute OG / canonical / sitemap / robots URLs.
 *
 * Prefers an explicit NEXT_PUBLIC_APP_URL. On Vercel production we pin the
 * stable alias instead of the per-deploy VERCEL_URL so canonical/OG links
 * don't churn between deploys. Falls back to the per-deploy URL on previews
 * and to localhost in dev.
 */
export const SITE_URL =
  (process.env.NEXT_PUBLIC_APP_URL?.trim() || undefined) ??
  (process.env.VERCEL_ENV === "production"
    ? "https://onelink-mauve-nu.vercel.app"
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
