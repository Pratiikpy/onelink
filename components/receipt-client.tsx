"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ExternalLink,
  ReceiptText,
  Share2,
  ShieldCheck,
} from "lucide-react";

import { Logo } from "@/components/onelink/logo";
import { HashMono } from "@/components/onelink/hash-mono";
import { ProofDrawer } from "@/components/onelink/proof-drawer";
import { ARC_EXPLORER_URL, isDemoTxHash } from "@/lib/arc";
import type { PaymentLink } from "@/lib/payments";
import { paymentMethodLabel } from "@/lib/payments";
import { getPaymentLinkById } from "@/lib/storage";
import { shareOrCopy, useCopy } from "@/lib/share";
import { formatDateTime, formatUSDC, shortHash, truncateAddr } from "@/lib/format";

export function ReceiptClient({ id }: { id: string }) {
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { copied, copy } = useCopy();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        if (id === "demo") {
          if (!cancelled) setLink(null);
          return;
        }
        const result = await getPaymentLinkById(id);
        if (!cancelled) setLink(result);
      } catch (err) {
        if (!cancelled) {
          setLink(null);
          setLoadError(
            err instanceof Error ? err.message : "Could not load this receipt.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center text-sm text-muted-foreground">
        Loading receipt…
      </div>
    );
  }

  if (!link) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <ReceiptText className="mx-auto h-10 w-10 text-foreground/30" />
        <h1 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em]">
          {loadError ? "Could not load receipt" : "No receipt yet"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {loadError || "Create and pay a link to generate a receipt."}
        </p>
        <Link
          href="/create"
          className="mt-7 inline-flex h-10 items-center rounded-md bg-foreground px-5 text-sm font-medium text-background"
        >
          Create link
        </Link>
      </div>
    );
  }

  const demo = isDemoTxHash(link.txHash);
  const verified = link.status === "paid" && !demo;
  const arcscan =
    link.txHash && !demo ? `${ARC_EXPLORER_URL}/tx/${link.txHash}` : ARC_EXPLORER_URL;
  const receiptUrl =
    typeof window === "undefined"
      ? `/receipt/${link.id}`
      : `${window.location.origin}/receipt/${link.id}`;

  return (
    <div className="min-h-screen bg-background page-in">
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <Logo />
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Open dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-14">
        <div className="rounded-2xl border border-hairline bg-surface p-8 card-lift">
          <div className="flex items-center gap-2">
            {verified ? (
              <>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-success text-success-foreground">
                  <Check className="h-4 w-4" />
                </span>
                <p className="text-sm font-medium tracking-tight text-success">
                  Paid · verified on Arc
                </p>
              </>
            ) : demo ? (
              <p className="text-sm font-medium tracking-tight text-warning-foreground">
                Demo receipt · no on-chain settlement
              </p>
            ) : (
              <p className="text-sm font-medium tracking-tight text-muted-foreground">
                {link.status === "paid"
                  ? "Paid · awaiting on-chain confirmation"
                  : `Status: ${link.status}`}
              </p>
            )}
          </div>

          <p className="mt-7 flex items-baseline gap-2 font-display text-[64px] font-semibold leading-none tracking-[-0.045em] tabular-nums">
            <span>{formatUSDC(link.amountUSDC)}</span>
            <span className="text-lg font-medium tracking-tight text-muted-foreground">USDC</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground break-words">{link.memo}</p>

          <div className="mt-7 space-y-3 border-t border-hairline pt-5 text-sm">
            <Row
              k="From"
              v={
                link.payerWallet ? (
                  <HashMono
                    value={link.payerWallet}
                    display={truncateAddr(link.payerWallet)}
                  />
                ) : (
                  "—"
                )
              }
            />
            <Row
              k="To"
              v={
                <HashMono
                  value={link.recipientWallet}
                  display={truncateAddr(link.recipientWallet)}
                />
              }
            />
            <Row
              k="Method"
              v={
                <span className="font-mono text-xs">
                  {paymentMethodLabel(link.paymentMethod)}
                </span>
              }
            />
            <Row
              k="Source"
              v={
                <span className="font-mono text-xs uppercase">
                  {link.sourceChain ?? "Arc_Testnet"}
                </span>
              }
            />
            <Row k="Created" v={formatDateTime(link.createdAt)} />
            <Row k="Last update" v={formatDateTime(link.updatedAt)} />
            <Row
              k="Tx hash"
              v={
                link.txHash ? (
                  <HashMono
                    value={link.txHash}
                    display={shortHash(link.txHash)}
                    copyable={!demo}
                  />
                ) : (
                  "—"
                )
              }
            />
          </div>

          <div className="mt-6 flex w-full flex-col gap-2 rounded-md border border-success/20 bg-success/[0.06] p-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <span className="inline-flex items-center gap-2 text-success">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>
                {verified
                  ? "Server-verified against PaymentCompleted event"
                  : demo
                  ? "Demo state — no on-chain proof"
                  : "Awaiting verified Arc event"}
              </span>
            </span>
            <ProofDrawer link={link}>
              <button className="inline-flex items-center gap-1 self-start font-medium text-foreground underline-offset-2 hover:underline sm:self-auto">
                View proof <ArrowRight className="h-3 w-3" />
              </button>
            </ProofDrawer>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <a
              href={arcscan}
              target="_blank"
              rel="noreferrer"
              className={
                demo
                  ? "pointer-events-none inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-hairline bg-background text-sm font-medium opacity-50"
                  : "inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-hairline bg-background text-sm font-medium hover:bg-muted"
              }
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {demo ? "Demo · no Arcscan" : "Arcscan"}
            </a>
            <button
              type="button"
              onClick={() => copy(receiptUrl)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-hairline bg-background text-sm font-medium hover:bg-muted"
            >
              {copied ? "Copied" : "Copy URL"}
            </button>
          </div>
          <button
            type="button"
            onClick={() =>
              shareOrCopy({
                title: `${link.amountUSDC} USDC · OneLink receipt`,
                text: link.memo,
                url: receiptUrl,
              })
            }
            className="mt-2 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-foreground text-sm font-medium text-background"
          >
            <Share2 className="h-4 w-4" /> Share receipt
          </button>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Receipt ID <span className="font-mono">{link.id}</span>
        </p>
      </main>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline pb-2 last:border-0">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}
