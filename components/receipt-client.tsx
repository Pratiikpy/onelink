"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Check, Copy, ExternalLink, ReceiptText } from "lucide-react";
import { Button, Card, Pill } from "@/components/ui";
import { ARC_EXPLORER_URL, explorerTx, isDemoTxHash } from "@/lib/arc";
import type { PaymentLink } from "@/lib/payments";
import { formatTimestamp, paymentMethodLabel, receiptPath, shortAddress, statusTone } from "@/lib/payments";
import { getPaymentLinkById } from "@/lib/storage";
import { useCopy } from "@/lib/share";

export function ReceiptClient({ id }: { id: string }) {
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { copied, copy } = useCopy();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        setLink(id === "demo" ? null : await getPaymentLinkById(id));
      } catch (err) {
        setLink(null);
        setLoadError(err instanceof Error ? err.message : "Could not load this receipt.");
      } finally {
        setLoading(false);
      }
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
        <ReceiptText className="mx-auto size-10 text-lime" />
        <p className="mt-4 text-2xl font-semibold">{loadError ? "Could not load receipt" : "No receipt yet"}</p>
        <p className="mt-2 text-sm text-white/50">
          {loadError || "Create and pay a link to generate a receipt."}
        </p>
        <Link href="/create">
          <Button className="mt-5">Create link</Button>
        </Link>
      </Card>
    );
  }

  const receiptUrl =
    typeof window === "undefined" ? receiptPath(link.id) : `${window.location.origin}${receiptPath(link.id)}`;

  return (
    <div className="mx-auto max-w-[720px] space-y-5 xl:px-16">
      <Card className="overflow-hidden rounded-[34px] p-0">
        <div className="bg-lime p-8 text-ink">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[13px] uppercase tracking-[0.18em] opacity-70">Receipt</p>
              <h1 className="mt-2 text-[48px] font-medium tracking-[-0.04em]">{link.amountUSDC} USDC</h1>
            </div>
            <div className="grid size-14 place-items-center rounded-2xl bg-ink/12">
              <BadgeCheck className="size-7" />
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between rounded-[22px] bg-white/[0.04] p-4">
            <span className="mono-label text-[12px]">Status</span>
            <Pill className={statusTone(link.status)}>{link.status}</Pill>
          </div>
          {[
            ["Memo", link.memo],
            ["Receiver", shortAddress(link.recipientWallet)],
            ["Payer", shortAddress(link.payerWallet)],
            ["Network", "Arc Testnet"],
            ["Method", paymentMethodLabel(link.paymentMethod)],
            ["Created", formatTimestamp(link.createdAt)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 border-b border-white/8 pb-3">
              <span className="mono-label text-[12px]">{label}</span>
              <span className="text-right text-[15px] font-semibold text-white/80">{value}</span>
            </div>
          ))}

          {isDemoTxHash(link.txHash) && (
            <div className="rounded-2xl border border-amber/30 bg-amber/10 p-3 text-xs font-semibold text-amber">
              This receipt was generated in demo mode. No USDC moved on-chain.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="secondary" onClick={() => copy(receiptUrl)}>
              {copied ? <Check className="size-4 text-lime" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <a
              href={
                link.txHash && !isDemoTxHash(link.txHash)
                  ? explorerTx(link.txHash)
                  : ARC_EXPLORER_URL
              }
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="secondary"
                className="w-full"
                disabled={isDemoTxHash(link.txHash)}
              >
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
