import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mobile",
  description:
    "OneLink on mobile: create, share and pay USDC links in a tap — verified on Arc Testnet.",
  alternates: { canonical: "/mobile" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
