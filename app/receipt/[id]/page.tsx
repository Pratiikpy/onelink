import type { Metadata } from "next";
import { ReceiptClient } from "@/components/receipt-client";

export const metadata: Metadata = {
  title: "Receipt",
  description: "USDC payment receipt with Arcscan settlement link.",
  robots: { index: false, follow: false },
};

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReceiptClient id={id} />;
}
