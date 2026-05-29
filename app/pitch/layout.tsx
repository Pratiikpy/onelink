import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pitch",
  description:
    "Why OneLink: USDC payment links settled and verified on Arc Testnet via Circle CCTP — non-custodial, server-verified receipts.",
  alternates: { canonical: "/pitch" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
