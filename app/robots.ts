import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Receipt + pay pages render private financial data — index only the
        // marketing surface, not user-generated link URLs.
        disallow: ["/pay/", "/receipt/", "/dashboard", "/settings"],
      },
    ],
    sitemap: `${SITE_URL.replace(/\/$/, "")}/sitemap.xml`,
  };
}
