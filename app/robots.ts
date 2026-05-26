import type { MetadataRoute } from "next";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

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
    sitemap: `${appUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
