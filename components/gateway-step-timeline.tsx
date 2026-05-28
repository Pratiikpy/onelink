"use client";

import { Check, Loader2, X } from "lucide-react";

import type { BridgeStepState, GatewayStepName } from "@/lib/circle-payments";
import { cn } from "@/lib/utils";

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
  if (state === "success") return "border-success bg-success text-success-foreground";
  if (state === "active") return "border-foreground bg-background text-foreground";
  if (state === "error") return "border-destructive bg-destructive/10 text-destructive";
  return "border-hairline bg-background text-muted-foreground";
}

export function GatewayStepTimeline({
  steps,
  sourceLabel,
  className = "",
}: {
  steps: Partial<
    Record<
      GatewayStepName,
      { state: BridgeStepState; sourceLabel?: string; txHash?: string; error?: string }
    >
  >;
  sourceLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[18px] border border-hairline bg-surface p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Gateway timeline
        </p>
        <span className="text-right text-[11px] font-medium text-muted-foreground">
          Unified balance{sourceLabel ? ` · ${sourceLabel} → Arc` : ""}
        </span>
      </div>

      <ol className="mt-4 space-y-3">
        {stages.map((stage, index) => {
          const meta = steps[stage.id];
          const state: StageState = meta?.state ?? "idle";
          return (
            <li key={stage.id} className="flex gap-3">
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] font-bold",
                  dotClasses(state),
                )}
              >
                {state === "success" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : state === "active" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : state === "error" ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-[13px] font-semibold",
                    state === "active" ? "text-foreground" : "text-foreground",
                  )}
                >
                  {stage.label}
                </p>
                <p className="mt-1 text-[11.5px] leading-5 text-muted-foreground">
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
