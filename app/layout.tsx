import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { DemoBanner } from "@/components/onelink/demo-banner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
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
    title: "OneLink Collect — Supported USDC payments settled on Arc.",
    description:
      "Create and pay USDC collection links on Arc Testnet using implemented Circle App Kit routes.",
    url: appUrl,
    siteName: "OneLink Collect",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OneLink Collect",
    description:
      "One link for supported testnet USDC routes, settled and verified on Arc.",
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
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <DemoBanner />
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
