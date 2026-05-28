"use client";

import { ArrowUpRight, Check, Fuel, ShieldCheck, Wallet, Zap } from "lucide-react";
import {
  ARC_CHAIN_ID,
  ARC_EXPLORER_URL,
  ARC_FAUCET_URL,
  ARC_USDC_ADDRESS,
} from "@/lib/arc";

type PreFlightTone = "ready" | "attention" | "info";

type PreFlightItem = {
  label: string;
  value: string;
  tone: PreFlightTone;
  icon: typeof Wallet;
};

function toneClasses(tone: PreFlightTone) {
  if (tone === "ready") return "border-lime/35 bg-lime/[0.08] text-lime";
  if (tone === "attention") return "border-amber/35 bg-amber/[0.08] text-amber";
  return "border-white/10 bg-white/[0.035] text-white/68";
}

function iconWrapClasses(tone: PreFlightTone) {
  if (tone === "ready") return "bg-lime text-ink";
  if (tone === "attention") return "bg-amber/[0.16] text-amber";
  return "bg-white/[0.05] text-white/55";
}

/**
 * Arc pre-flight checklist. Shows the payer everything they need to know before
 * signing: which network they'll settle on, their Arc USDC balance, whether
 * they need to top up, that USDC is the gas token on Arc, and that the receipt
 * lands on Arcscan after server verification.
 *
 * Used on the checkout pay screen. Honest about Arc's quirks (USDC-as-gas,
 * 6 decimals on the ERC-20 surface) without overwhelming the payer.
 */
export function ArcPreFlight({
  amountUSDC,
  balanceUSDC,
  isConnected,
  needsApproval = true,
  className = "",
}: {
  amountUSDC: string;
  balanceUSDC?: string;
  isConnected: boolean;
  needsApproval?: boolean;
  className?: string;
}) {
  const amountNumber = Number(amountUSDC);
  const balanceNumber = balanceUSDC !== undefined ? Number(balanceUSDC) : null;
  const hasBalance = balanceNumber !== null && Number.isFinite(balanceNumber);
  const sufficient = hasBalance && balanceNumber >= amountNumber;
  const missing = hasBalance ? Math.max(0, amountNumber - balanceNumber) : null;

  const balanceItem: PreFlightItem = !isConnected
    ? {
        label: "Arc ERC-20 USDC",
        value: "Connect wallet to check",
        tone: "info",
        icon: Wallet,
      }
    : !hasBalance
      ? {
          label: "Arc ERC-20 USDC",
          value: "Loading…",
          tone: "info",
          icon: Wallet,
        }
      : sufficient
        ? {
            label: "Arc ERC-20 USDC",
            value: `${balanceNumber.toFixed(2)} USDC · enough for direct payment`,
            tone: "ready",
            icon: Wallet,
          }
        : {
            label: "Arc ERC-20 USDC",
            value: `${balanceNumber.toFixed(2)} USDC · need ${missing!.toFixed(2)} more`,
            tone: "attention",
            icon: Wallet,
          };

  const items: PreFlightItem[] = [
    {
      label: "Network",
      value: `Arc Testnet · chain ${ARC_CHAIN_ID}`,
      tone: "ready",
      icon: ShieldCheck,
    },
    balanceItem,
    {
      label: "Gas",
      value: "USDC native gas · no ETH on Arc",
      tone: "info",
      icon: Fuel,
    },
    {
      label: needsApproval ? "Approval" : "Approval not required",
      value: needsApproval
        ? "Wallet will request a USDC approval before settlement"
        : "Settlement signs directly",
      tone: "info",
      icon: Zap,
    },
    {
      label: "Receipt",
      value: "Verified on Arcscan after server reconciliation",
      tone: "info",
      icon: Check,
    },
  ];

  return (
    <div
      className={`rounded-[18px] border border-white/10 bg-white/[0.025] p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className="mono-label text-[10px]">Arc pre-flight</p>
        <span className="text-[11px] font-medium text-white/38">
          What happens before you sign
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.label}
              className={`flex items-start gap-3 rounded-[14px] border p-3 ${toneClasses(item.tone)}`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-[10px] ${iconWrapClasses(item.tone)}`}
              >
                <Icon className="size-3.5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[12.5px] font-medium leading-5">
                  {item.value}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {isConnected && hasBalance && !sufficient && (
        <div className="mt-3 flex flex-col gap-2 rounded-[14px] border border-amber/30 bg-amber/[0.07] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-amber">Top up Arc USDC</p>
            <p className="mt-0.5 text-[11.5px] leading-5 text-amber/85">
              Arc Testnet needs ERC-20 USDC for payment and native USDC for gas. Use
              the Circle faucet, then refresh this page.
            </p>
          </div>
          <a
            href={ARC_FAUCET_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-amber px-3 text-[12px] font-semibold text-ink transition hover:bg-[#ffd084]"
          >
            Open Circle faucet
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      )}

      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-white/35">
        <span className="font-mono uppercase tracking-[0.16em]">USDC</span>
        <span className="truncate font-mono">{ARC_USDC_ADDRESS}</span>
        <a
          href={ARC_EXPLORER_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-white/55 transition hover:text-white"
        >
          Arcscan
          <ArrowUpRight className="size-3" />
        </a>
      </p>
    </div>
  );
}
