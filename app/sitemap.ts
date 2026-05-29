import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Stable build-independent date so lastModified doesn't churn on every deploy
// (argless build-time `new Date()` is the SEO problem we're avoiding here).
const LAST_MODIFIED = new Date("2026-05-29");

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.replace(/\/$/, "");
  return [
    { url: `${base}/`, lastModified: LAST_MODIFIED, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/create`, lastModified: LAST_MODIFIED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/pitch`, lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/how-it-works`, lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/whitepaper`, lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/security`, lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/mobile`, lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.3 },
  ];
}
