"use client";

import { ArrowUpRight, Check, Loader2, X } from "lucide-react";

import type { BridgeStepName, BridgeStepState } from "@/lib/circle-payments";
import { cn } from "@/lib/utils";

type StageId = BridgeStepName | "settle" | "receipt";
type StageState = BridgeStepState | "idle";

type Stage = {
  id: StageId;
  label: string;
  detail: string;
};

const stages: Stage[] = [
  {
    id: "approve",
    label: "Approve USDC",
    detail: "Allow Circle's CCTP contract to move your USDC on the source chain.",
  },
  {
    id: "burn",
    label: "Burn on source",
    detail: "USDC is destroyed on the source chain to mint new USDC on Arc.",
  },
  {
    id: "fetchAttestation",
    label: "Circle attestation",
    detail: "Circle's IRIS service signs a proof of the burn.",
  },
  {
    id: "mint",
    label: "Mint on Arc",
    detail: "USDC arrives on Arc Testnet at your wallet.",
  },
  {
    id: "settle",
    label: "Settle invoice",
    detail: "OneLinkCollect on Arc records the payment with verified state.",
  },
  {
    id: "receipt",
    label: "Receipt ready",
    detail: "The verified Arcscan transaction becomes the receipt's proof.",
  },
];

function dotClasses(state: StageState) {
  if (state === "success") return "border-success bg-success text-success-foreground";
  if (state === "active") return "border-foreground bg-background text-foreground";
  if (state === "error") return "border-destructive bg-destructive/10 text-destructive";
  return "border-hairline bg-background text-muted-foreground";
}

function textClasses(state: StageState) {
  if (state === "success") return "text-foreground";
  if (state === "active") return "text-foreground";
  if (state === "error") return "text-destructive";
  return "text-muted-foreground";
}

export function BridgeStepTimeline({
  steps,
  sourceLabel = "source chain",
  settleState = "idle",
  receiptState = "idle",
  className = "",
}: {
  steps: Partial<
    Record<
      BridgeStepName,
      { state: BridgeStepState; txHash?: string; explorerUrl?: string; error?: string }
    >
  >;
  sourceLabel?: string;
  settleState?: StageState;
  receiptState?: StageState;
  className?: string;
}) {
  function stageState(stage: Stage): StageState {
    if (stage.id === "settle") return settleState;
    if (stage.id === "receipt") return receiptState;
    const entry = steps[stage.id as BridgeStepName];
    return entry?.state ?? "idle";
  }
  function stageMeta(stage: Stage) {
    if (stage.id === "settle" || stage.id === "receipt") return undefined;
    return steps[stage.id as BridgeStepName];
  }

  return (
    <div className={cn("rounded-[18px] border border-hairline bg-surface p-4", className)}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Bridge timeline
        </p>
        <span className="text-[11px] font-medium text-muted-foreground">
          Live Circle CCTP · {sourceLabel} → Arc
        </span>
      </div>

      <ol className="mt-4 space-y-3">
        {stages.map((stage, index) => {
          const state = stageState(stage);
          const meta = stageMeta(stage);
          const isLast = index === stages.length - 1;

          return (
            <li key={stage.id} className="relative flex gap-3">
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[13px] top-7 h-[calc(100%-12px)] w-px",
                    state === "success" ? "bg-success/50" : "bg-hairline",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] font-bold",
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
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center justify-between gap-3">
                  <p className={cn("text-[13px] font-semibold", textClasses(state))}>
                    {stage.label}
                  </p>
                  {meta?.txHash && meta.explorerUrl && (
                    <a
                      href={meta.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
                    >
                      View tx <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <p
                  className={cn(
                    "mt-1 text-[11.5px] leading-5",
                    state === "idle" ? "text-muted-foreground/70" : "text-muted-foreground",
                  )}
                >
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
