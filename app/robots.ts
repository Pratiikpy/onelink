import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Receipt + pay pages render private financial data — index only the
        // marketing surface, not user-generated link URLs.
        disallow: ["/pay/", "/receipt/", "/dashboard"],
      },
    ],
    sitemap: `${appUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
