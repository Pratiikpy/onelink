"use client";

import { useState } from "react";
import { ArrowUpRight, BadgeCheck, Check, ChevronDown, Copy, ShieldCheck } from "lucide-react";
import {
  ARC_CHAIN_ID,
  ARC_EXPLORER_URL,
  ARC_USDC_ADDRESS,
  explorerTx,
  isDemoTxHash,
} from "@/lib/arc";
import { ONELINK_CONTRACT_ADDRESS } from "@/lib/contracts";
import { useCopy } from "@/lib/share";
import type { PaymentLink } from "@/lib/payments";

type ProofRowTone = "neutral" | "verified" | "demo";

function methodLabelFor(link: PaymentLink): string {
  if (link.settlementMode === "profile") return "payRecipient · Arc";
  if (link.paymentMethod === "arc-direct") return "payLink · Arc";
  if (link.paymentMethod === "app-kit-bridge") return "payLink · Arc (after CCTP bridge)";
  if (link.paymentMethod === "unified-balance") return "payLink · Arc (Gateway spend)";
  if (link.paymentMethod === "demo") return "Demo · no on-chain settlement";
  return "Pending";
}

/**
 * Receipt proof drawer. Collapsible on mobile, always-open on larger screens.
 * Shows the verifiable details a technical reviewer (or judge) would want to
 * inspect: chain, contract address, on-chain tx hash, payment method, server-
 * verified flag, and a one-tap Arcscan link.
 *
 * When the receipt was created in demo mode (no on-chain settlement), the
 * drawer is honest about it: the verified flag is off and the explorer link
 * goes to the chain's home page rather than to a transaction that doesn't exist.
 */
export function ProofDrawer({ link }: { link: PaymentLink }) {
  const [open, setOpen] = useState(false);
  const isDemo = isDemoTxHash(link.txHash);
  const isPaid = link.status === "paid";
  const verified = isPaid && !isDemo;
  const txExplorer = link.txHash && !isDemo ? explorerTx(link.txHash) : ARC_EXPLORER_URL;

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.025]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-5 text-left transition hover:bg-white/[0.03] sm:p-6"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-2xl ${
              verified ? "bg-lime/[0.16] text-lime" : "bg-white/[0.06] text-white/55"
            }`}
          >
            {verified ? <ShieldCheck className="size-5" /> : <BadgeCheck className="size-5" />}
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-white">Proof drawer</p>
            <p className="mt-0.5 text-[12px] leading-5 text-white/52">
              {verified
                ? "Settlement verified on Arc Testnet · server reconciled"
                : isDemo
                  ? "Demo receipt · no on-chain settlement"
                  : "Awaiting verified on-chain settlement"}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-white/55 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-1 border-t border-white/8 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <ProofRow label="Network" value="Arc Testnet" tone="neutral" />
          <ProofRow label="Chain ID" value={String(ARC_CHAIN_ID)} mono tone="neutral" />
          <ProofRow
            label="Settlement contract"
            value={ONELINK_CONTRACT_ADDRESS}
            mono
            tone="neutral"
            copyable
          />
          <ProofRow
            label="Token"
            value={`USDC · ${ARC_USDC_ADDRESS}`}
            mono
            tone="neutral"
            copyable
            copyValue={ARC_USDC_ADDRESS}
          />
          <ProofRow
            label="Method"
            value={methodLabelFor(link)}
            tone="neutral"
          />
          <ProofRow
            label="Tx hash"
            value={link.txHash ?? "—"}
            mono
            tone={isDemo ? "demo" : "neutral"}
            copyable={Boolean(link.txHash) && !isDemo}
            copyValue={link.txHash ?? undefined}
          />
          <ProofRow
            label="Server verified"
            value={verified ? "Yes · final state" : isDemo ? "Demo · no settlement" : "Awaiting"}
            tone={verified ? "verified" : isDemo ? "demo" : "neutral"}
          />

          <a
            href={txExplorer}
            target="_blank"
            rel="noreferrer"
            className={`mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border text-[14px] font-semibold transition ${
              verified
                ? "border-lime/30 bg-lime/[0.12] text-lime hover:bg-lime/[0.18]"
                : "border-white/12 bg-white/[0.04] text-white/68 hover:border-white/22"
            } ${isDemo ? "pointer-events-none opacity-50" : ""}`}
          >
            {verified ? "Open on Arcscan" : isDemo ? "Demo · no Arcscan link" : "Arc explorer"}
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      )}
    </div>
  );
}

function ProofRow({
  label,
  value,
  mono,
  tone,
  copyable,
  copyValue,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone: ProofRowTone;
  copyable?: boolean;
  copyValue?: string;
}) {
  const { copied, copy } = useCopy();

  function valueClasses() {
    const base = mono ? "font-mono" : "font-medium";
    if (tone === "verified") return `${base} text-lime`;
    if (tone === "demo") return `${base} text-amber/85`;
    return `${base} text-white/82`;
  }

  return (
    <div className="flex flex-col gap-2 border-b border-white/[0.06] py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="mono-label text-[10.5px]">{label}</span>
      <span className="flex min-w-0 items-center gap-2 sm:justify-end">
        <span className={`truncate text-[13px] ${valueClasses()}`} title={value}>
          {value}
        </span>
        {copyable && copyValue && (
          <button
            type="button"
            onClick={() => copy(copyValue)}
            className="grid size-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-white/55 transition hover:border-white/22 hover:text-white"
            aria-label={`Copy ${label}`}
          >
            {copied ? <Check className="size-3.5 text-lime" /> : <Copy className="size-3.5" />}
          </button>
        )}
      </span>
    </div>
  );
}
