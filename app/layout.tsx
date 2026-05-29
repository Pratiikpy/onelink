import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { DemoBanner } from "@/components/onelink/demo-banner";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: {
    default: "OneLink Collect — One link. USDC routes. Verified on Arc.",
    template: "%s · OneLink Collect",
  },
  description:
    "Mobile-first USDC payment links settled on Arc Testnet. Pay directly on Arc or bridge from Base Sepolia through Circle App Kit and CCTP.",
  applicationName: "OneLink Collect",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon", type: "image/png", sizes: "64x64" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
    shortcut: ["/icon", "/icon.svg"],
  },
  keywords: [
    "USDC",
    "Arc",
    "Circle",
    "payments",
    "stablecoin",
    "CCTP",
    "App Kit",
    "Web3",
  ],
  openGraph: {
    title: "OneLink Collect — Get paid in USDC. Verified on Arc.",
    description:
      "Create and pay USDC payment links on Arc Testnet. Pay directly on Arc or bridge in via Circle CCTP — with a server-verified receipt.",
    url: SITE_URL,
    siteName: "OneLink Collect",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OneLink Collect",
    description:
      "One link to get paid in USDC, settled and verified on Arc.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0f12",
  width: "device-width",
  initialScale: 1,
  // Allow pinch-zoom — locking it breaks WCAG 1.4.4 (Resize Text) and is a
  // common a11y regression on mobile-first PWAs.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "OneLink Collect",
              url: "https://onelink-mauve-nu.vercel.app",
            }),
          }}
        />
        <DemoBanner />
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
