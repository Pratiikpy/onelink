"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Check, Copy, ReceiptText } from "lucide-react";
import { ProofDrawer } from "@/components/proof-drawer";
import { Button, Card, Pill } from "@/components/ui";
import { isDemoTxHash } from "@/lib/arc";
import type { PaymentLink } from "@/lib/payments";
import { formatTimestamp, paymentMethodLabel, receiptPath, shortAddress, statusTone } from "@/lib/payments";
import { getPaymentLinkById } from "@/lib/storage";
import { useCopy } from "@/lib/share";

function receiptTimeline(link: PaymentLink) {
  const paid = link.status === "paid";
  const failed = link.status === "failed" || link.status === "cancelled" || link.status === "expired";
  const bridged = link.paymentMethod === "app-kit-bridge";

  return [
    { label: "Payment link created", complete: true },
    { label: bridged ? "USDC bridged with Circle CCTP" : "Arc payment route selected", complete: paid },
    { label: "Arc settlement verified", complete: paid },
    { label: "Receipt issued", complete: paid },
  ].map((step) => ({ ...step, failed: failed && !step.complete }));
}

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
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="font-mono text-[13px] uppercase tracking-[0.18em] opacity-70">Receipt</p>
              <h1 className="mt-2 text-[48px] font-medium tracking-[-0.04em]">{link.amountUSDC} USDC</h1>
              <p className="mt-3 max-w-[420px] text-[15px] font-semibold text-ink/60">
                Verified on Arc Testnet after server-side settlement reconciliation.
              </p>
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

          <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="mono-label text-[12px]">Verification timeline</p>
                <p className="mt-2 text-[13px] text-white/42">Final state is anchored to Arc proof.</p>
              </div>
              <span className="rounded-full bg-lime/[0.12] px-3 py-1.5 text-[12px] font-semibold text-lime">
                Verified proof
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {receiptTimeline(link).map((step, index) => (
                <div key={step.label} className="flex items-center gap-3 rounded-[18px] bg-black/18 p-3">
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${
                      step.complete
                        ? "border-lime bg-lime text-ink"
                        : step.failed
                          ? "border-danger/50 bg-danger/12 text-[#ffbcbc]"
                          : "border-white/10 bg-white/[0.04] text-white/35"
                    }`}
                  >
                    {step.complete ? <Check className="size-3.5" /> : index + 1}
                  </span>
                  <span className="text-[13px] font-semibold text-white/70">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {[
            ["Memo", link.memo],
            ["Receiver", shortAddress(link.recipientWallet)],
            ["Payer", shortAddress(link.payerWallet)],
            ["Network", "Arc Testnet · USDC native gas"],
            ["Method", paymentMethodLabel(link.paymentMethod)],
            ["Created", formatTimestamp(link.createdAt)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 border-b border-white/8 pb-3">
              <span className="mono-label text-[12px]">{label}</span>
              <span className="text-right text-[15px] font-semibold text-white/80">{value}</span>
            </div>
          ))}

          <ProofDrawer link={link} />

          {isDemoTxHash(link.txHash) && (
            <div className="rounded-2xl border border-amber/30 bg-amber/10 p-3 text-xs font-semibold text-amber">
              This receipt was generated in demo mode. No USDC moved on-chain.
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => copy(receiptUrl)}>
              {copied ? <Check className="size-4 text-lime" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy receipt URL"}
            </Button>
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full">
                Back to links
              </Button>
            </Link>
          </div>

          <div className="pt-1">
            <Link href="/security">
              <Button variant="ghost" className="w-full">
                Verification scope
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
