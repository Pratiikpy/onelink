import type { Metadata } from "next";
import { PayLinkClient } from "@/components/pay-link-client";

export const metadata: Metadata = {
  title: "Pay",
  description: "Settle a USDC payment link on Arc Testnet.",
  robots: { index: false, follow: false },
};

export default async function PayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PayLinkClient slug={slug} />;
}
