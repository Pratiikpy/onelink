"use client";

import {
  ArrowUpRight,
  Check,
  Fuel,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

import {
  ARC_CHAIN_ID,
  ARC_EXPLORER_URL,
  ARC_FAUCET_URL,
  ARC_USDC_ADDRESS,
} from "@/lib/arc";
import { cn } from "@/lib/utils";

type PreFlightTone = "ready" | "attention" | "info";

type PreFlightItem = {
  label: string;
  value: string;
  tone: PreFlightTone;
  icon: typeof Wallet;
};

export type PreFlightRoute = "arc-direct" | "app-kit-bridge" | "unified-balance";

function toneClasses(tone: PreFlightTone) {
  if (tone === "ready") return "border-success/30 bg-success/[0.07] text-success";
  if (tone === "attention") return "border-warning/30 bg-warning/[0.08] text-warning-foreground";
  return "border-hairline bg-background text-muted-foreground";
}

function iconWrapClasses(tone: PreFlightTone) {
  if (tone === "ready") return "bg-success text-success-foreground";
  if (tone === "attention") return "bg-warning/[0.16] text-warning-foreground";
  return "bg-muted text-muted-foreground";
}

/**
 * Arc pre-flight checklist. Shown on the pay screen so the payer knows what
 * happens before they sign: which network they'll settle on, where their Arc
 * USDC is sourced from, that USDC is the gas token on Arc, and that the
 * receipt lands on Arcscan after server verification.
 *
 * The source row adapts per route. Faucet helper only appears for arc-direct
 * when the connected wallet's Arc USDC is below the amount due.
 */
export function ArcPreFlight({
  amountUSDC,
  balanceUSDC,
  isConnected,
  route = "arc-direct",
  needsApproval = true,
  className = "",
}: {
  amountUSDC: string;
  balanceUSDC?: string;
  isConnected: boolean;
  route?: PreFlightRoute;
  needsApproval?: boolean;
  className?: string;
}) {
  const amountNumber = Number(amountUSDC);
  const balanceNumber = balanceUSDC !== undefined ? Number(balanceUSDC) : null;
  const hasBalance = balanceNumber !== null && Number.isFinite(balanceNumber);
  const sufficient = hasBalance && balanceNumber >= amountNumber;
  const missing = hasBalance ? Math.max(0, amountNumber - balanceNumber) : null;

  let sourceItem: PreFlightItem;

  if (route === "app-kit-bridge") {
    sourceItem = {
      label: "Arc USDC source",
      value: "Circle CCTP bridges your USDC into Arc before settlement",
      tone: "info",
      icon: RouteIcon,
    };
  } else if (route === "unified-balance") {
    sourceItem = {
      label: "Arc USDC source",
      value: "Circle Gateway mints from your confirmed unified balance",
      tone: "info",
      icon: Sparkles,
    };
  } else if (!isConnected) {
    sourceItem = {
      label: "Arc USDC balance",
      value: "Connect wallet to check",
      tone: "info",
      icon: Wallet,
    };
  } else if (!hasBalance) {
    sourceItem = {
      label: "Arc USDC balance",
      value: "Loading…",
      tone: "info",
      icon: Wallet,
    };
  } else if (sufficient) {
    sourceItem = {
      label: "Arc USDC balance",
      value: `${balanceNumber.toFixed(2)} USDC · enough to pay`,
      tone: "ready",
      icon: Wallet,
    };
  } else {
    sourceItem = {
      label: "Arc USDC balance",
      value: `${balanceNumber.toFixed(2)} USDC · need ${missing!.toFixed(2)} more`,
      tone: "attention",
      icon: Wallet,
    };
  }

  const items: PreFlightItem[] = [
    {
      label: "Network",
      value: `Arc Testnet · chain ${ARC_CHAIN_ID}`,
      tone: "ready",
      icon: ShieldCheck,
    },
    sourceItem,
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

  const showFaucetHelper =
    route === "arc-direct" && isConnected && hasBalance && !sufficient;

  return (
    <div
      className={cn(
        "rounded-[18px] border border-hairline bg-surface p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Arc pre-flight
        </p>
        <span className="text-[11px] font-medium text-muted-foreground">
          What happens before you sign
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.label}
              className={cn(
                "flex items-start gap-3 rounded-[14px] border p-3",
                toneClasses(item.tone),
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-[10px]",
                  iconWrapClasses(item.tone),
                )}
              >
                <Icon className="h-3.5 w-3.5" />
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

      {showFaucetHelper && (
        <div className="mt-3 flex flex-col gap-2 rounded-[14px] border border-warning/30 bg-warning/[0.07] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-warning-foreground">
              Top up Arc USDC
            </p>
            <p className="mt-0.5 text-[11.5px] leading-5 text-muted-foreground">
              Arc Testnet uses USDC for both gas and payment. Use the Circle
              faucet, then refresh this page.
            </p>
          </div>
          <a
            href={ARC_FAUCET_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-foreground px-3 text-[12px] font-semibold text-background transition hover:opacity-90"
          >
            Open Circle faucet
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-muted-foreground">
        <span className="font-mono uppercase tracking-[0.16em]">USDC</span>
        <span className="truncate font-mono">{ARC_USDC_ADDRESS}</span>
        <a
          href={ARC_EXPLORER_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 transition hover:text-foreground"
        >
          Arcscan
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </p>
    </div>
  );
}
