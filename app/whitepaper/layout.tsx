import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Whitepaper",
  description:
    "How OneLink works: the OneLinkCollect contract on Arc, the server-verified settlement model, CCTP bridging, and on-chain proofs you can re-check.",
  alternates: { canonical: "/whitepaper" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
