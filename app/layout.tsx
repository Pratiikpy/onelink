import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Providers } from "@/components/providers";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "OneLink Collect — One link. Any USDC. Instantly on Arc.",
    template: "%s · OneLink Collect",
  },
  description:
    "Mobile-first USDC payment links that settle on Arc Testnet. Bridge from Base, Ethereum, or Arbitrum Sepolia through Circle App Kit, or pay directly with Unified Balance.",
  applicationName: "OneLink Collect",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
    shortcut: "/icon.svg",
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
    title: "OneLink Collect — One link. Any USDC. Instantly on Arc.",
    description:
      "Create and pay USDC collection links on Arc Testnet. Bridge from any chain via Circle App Kit.",
    url: appUrl,
    siteName: "OneLink Collect",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OneLink Collect",
    description:
      "One link. Any USDC. Instantly on Arc Testnet — powered by Circle App Kit.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
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
    <html lang="en" suppressHydrationWarning className={GeistSans.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
