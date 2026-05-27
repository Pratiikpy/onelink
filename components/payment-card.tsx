"use client";

import { useMemo } from "react";
import { Check, Copy, ExternalLink, ReceiptText, Share2 } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Card, Button, Pill } from "@/components/ui";
import { explorerTx, isDemoTxHash } from "@/lib/arc";
import type { PaymentLink } from "@/lib/payments";
import { paymentPath, receiptPath, shortAddress, statusTone } from "@/lib/payments";
import { shareOrCopy, useCopy } from "@/lib/share";

export function PaymentSummaryCard({ link }: { link: PaymentLink }) {
  const paymentUrl = useMemo(() => {
    if (typeof window === "undefined") return paymentPath(link.slug);
    return `${window.location.origin}${paymentPath(link.slug)}`;
  }, [link.slug]);
  const { copied, copy } = useCopy();

  async function share() {
    await shareOrCopy({
      title: `Pay ${link.amountUSDC} USDC on Arc`,
      text: link.memo,
      url: paymentUrl,
    });
  }

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

      {link.status === "unpaid" || link.status === "processing" ? (
        <div className="flex items-center justify-center rounded-2xl border border-white/8 bg-white p-4">
          <QRCodeSVG
            value={paymentUrl}
            size={168}
            bgColor="#ffffff"
            fgColor="#0A0A0C"
            level="M"
            marginSize={1}
          />
        </div>
      ) : (
        <div className="grid place-items-center rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
            {link.status === "paid" ? "Settled" : link.status === "cancelled" ? "Cancelled" : link.status}
          </p>
          <p className="mt-1 text-sm font-semibold text-white/55">
            This link is no longer accepting payments.
          </p>
        </div>
      )}

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

      <div className="grid grid-cols-3 gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => copy(paymentUrl)}
          className="w-full"
          aria-label="Copy payment link"
        >
          {copied ? <Check className="size-4 text-lime" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={share}
          className="w-full"
          aria-label="Share payment link"
        >
          <Share2 className="size-4" />
          Share
        </Button>
        <Link href={receiptPath(link.id)} className="w-full">
          <Button type="button" variant="secondary" className="w-full">
            <ReceiptText className="size-4" />
            Receipt
          </Button>
        </Link>
      </div>

      {link.txHash && !isDemoTxHash(link.txHash) && (
        <a
          href={explorerTx(link.txHash)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 text-sm font-bold text-lime"
        >
          View on Arcscan
          <ExternalLink className="size-4" />
        </a>
      )}

      {isDemoTxHash(link.txHash) && (
        <p className="text-center text-xs font-bold text-amber-200/80">
          Demo settlement · no on-chain transaction
        </p>
      )}
    </Card>
  );
}
