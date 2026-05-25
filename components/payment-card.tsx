"use client";

import { Copy, ExternalLink, ReceiptText } from "lucide-react";
import Link from "next/link";
import { Card, Button, Pill } from "@/components/ui";
import { explorerTx } from "@/lib/arc";
import type { PaymentLink } from "@/lib/payments";
import { shortAddress, statusTone } from "@/lib/payments";

export function PaymentSummaryCard({ link }: { link: PaymentLink }) {
  const paymentUrl =
    typeof window === "undefined" ? `/pay/${link.slug}` : `${window.location.origin}/pay/${link.slug}`;

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white/48">Collect request</p>
          <h2 className="mt-1 text-4xl font-black tracking-normal text-white">
            {link.amountUSDC} <span className="text-xl text-white/50">USDC</span>
          </h2>
        </div>
        <Pill className={statusTone(link.status)}>{link.status}</Pill>
      </div>

      <div className="rounded-2xl border border-white/8 bg-black/24 p-4">
        <p className="text-sm font-semibold text-white/45">Memo</p>
        <p className="mt-1 text-lg font-bold text-white">{link.memo}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <p className="text-white/40">Receiver</p>
          <p className="mt-1 font-bold">{shortAddress(link.recipientWallet)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <p className="text-white/40">Network</p>
          <p className="mt-1 font-bold">Arc Testnet</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigator.clipboard.writeText(paymentUrl)}
          className="w-full"
        >
          <Copy className="size-4" />
          Copy link
        </Button>
        <Link href={`/receipt/${link.id}`} className="w-full">
          <Button type="button" variant="secondary" className="w-full">
            <ReceiptText className="size-4" />
            Receipt
          </Button>
        </Link>
      </div>

      {link.txHash && (
        <a
          href={explorerTx(link.txHash)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 text-sm font-bold text-violet"
        >
          View on Arcscan
          <ExternalLink className="size-4" />
        </a>
      )}
    </Card>
  );
}
