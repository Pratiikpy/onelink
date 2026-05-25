"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Copy, ExternalLink, ReceiptText } from "lucide-react";
import { Button, Card, Pill } from "@/components/ui";
import { ARC_EXPLORER_URL, explorerTx } from "@/lib/arc";
import type { PaymentLink } from "@/lib/payments";
import { shortAddress, statusTone } from "@/lib/payments";
import { getPaymentLinkById } from "@/lib/storage";

export function ReceiptClient({ id }: { id: string }) {
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLink(id === "demo" ? null : await getPaymentLinkById(id));
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="font-bold text-white/60">Loading receipt</p>
      </Card>
    );
  }

  if (!link) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <ReceiptText className="mx-auto size-10 text-violet" />
        <p className="mt-4 text-2xl font-black">No receipt yet</p>
        <p className="mt-2 text-sm text-white/50">Create and pay a link to generate a receipt.</p>
        <Link href="/">
          <Button className="mt-5">Create link</Button>
        </Link>
      </Card>
    );
  }

  const receiptUrl =
    typeof window === "undefined" ? `/receipt/${link.id}` : `${window.location.origin}/receipt/${link.id}`;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="bg-violet p-6 text-ink">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] opacity-70">Receipt</p>
              <h1 className="mt-2 text-4xl font-black">{link.amountUSDC} USDC</h1>
            </div>
            <div className="grid size-14 place-items-center rounded-2xl bg-ink/12">
              <BadgeCheck className="size-7" />
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4">
            <span className="text-sm font-bold text-white/45">Status</span>
            <Pill className={statusTone(link.status)}>{link.status}</Pill>
          </div>
          {[
            ["Memo", link.memo],
            ["Receiver", shortAddress(link.recipientWallet)],
            ["Payer", shortAddress(link.payerWallet)],
            ["Network", "Arc Testnet"],
            ["Method", link.paymentMethod || "pending"],
            ["Created", new Date(link.createdAt).toLocaleString()],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 border-b border-white/8 pb-3">
              <span className="text-sm font-bold text-white/42">{label}</span>
              <span className="text-right text-sm font-bold text-white/80">{value}</span>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(receiptUrl)}>
              <Copy className="size-4" />
              Copy
            </Button>
            <a href={link.txHash ? explorerTx(link.txHash) : ARC_EXPLORER_URL} target="_blank" rel="noreferrer">
              <Button variant="secondary" className="w-full">
                <ExternalLink className="size-4" />
                Arcscan
              </Button>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
