"use client";

import { Check, Loader2, X } from "lucide-react";
import type { BridgeStepState, GatewayStepName } from "@/lib/circle-payments";

type StageState = BridgeStepState | "idle";

const stages: { id: GatewayStepName; label: string; detail: string }[] = [
  {
    id: "balance",
    label: "Find Gateway balance",
    detail: "Checks confirmed USDC previously deposited into Circle Gateway.",
  },
  {
    id: "sign",
    label: "Sign burn intent",
    detail: "Wallet signs the Gateway EIP-712 burn intent for the selected source chain.",
  },
  {
    id: "transfer",
    label: "Gateway attestation",
    detail: "Circle Gateway validates the burn intent and returns a mint attestation.",
  },
  {
    id: "mint",
    label: "Mint on Arc",
    detail: "Gateway Minter releases USDC on Arc before OneLink settles the invoice.",
  },
];

function dotClasses(state: StageState) {
  if (state === "success") return "border-lime bg-lime text-ink";
  if (state === "active") return "border-lime/55 bg-lime/[0.14] text-lime";
  if (state === "error") return "border-danger/45 bg-danger/[0.12] text-[#ffbcbc]";
  return "border-white/10 bg-white/[0.04] text-white/35";
}

export function GatewayStepTimeline({
  steps,
  sourceLabel,
  className = "",
}: {
  steps: Partial<Record<GatewayStepName, { state: BridgeStepState; sourceLabel?: string; txHash?: string; error?: string }>>;
  sourceLabel?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-[18px] border border-white/10 bg-white/[0.025] p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="mono-label text-[10px]">Gateway timeline</p>
        <span className="text-right text-[11px] font-medium text-white/38">
          Unified balance{sourceLabel ? ` · ${sourceLabel} → Arc` : ""}
        </span>
      </div>

      <ol className="mt-4 space-y-3">
        {stages.map((stage, index) => {
          const meta = steps[stage.id];
          const state = meta?.state ?? "idle";
          return (
            <li key={stage.id} className="flex gap-3">
              <span className={`grid size-7 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${dotClasses(state)}`}>
                {state === "success" ? (
                  <Check className="size-3.5" />
                ) : state === "active" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : state === "error" ? (
                  <X className="size-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className={state === "active" ? "text-[13px] font-semibold text-lime" : "text-[13px] font-semibold text-white/82"}>
                  {stage.label}
                </p>
                <p className="mt-1 text-[11.5px] leading-5 text-white/50">
                  {meta?.error && state === "error" ? meta.error : stage.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
