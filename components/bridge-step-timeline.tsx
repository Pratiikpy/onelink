"use client";

import { ArrowUpRight, Check, Loader2, X } from "lucide-react";
import type { BridgeStepName, BridgeStepState } from "@/lib/circle-payments";

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
  if (state === "success") return "border-lime bg-lime text-ink";
  if (state === "active") return "border-lime/55 bg-lime/[0.14] text-lime";
  if (state === "error") return "border-danger/45 bg-danger/[0.12] text-[#ffbcbc]";
  return "border-white/10 bg-white/[0.04] text-white/35";
}

function textClasses(state: StageState) {
  if (state === "success") return "text-white/82";
  if (state === "active") return "text-lime";
  if (state === "error") return "text-[#ffbcbc]";
  return "text-white/40";
}

/**
 * Live CCTP bridge timeline. Pass a map of step → state and the current
 * settle/receipt state. The component draws the four CCTP stages plus the
 * two OneLink stages (settle on Arc, receipt) as a single connected timeline.
 *
 * Used on the checkout pay screen when the payer picks the Base Sepolia → Arc
 * bridge route. Events come from `kit.on('bridge.*')` (see
 * `lib/circle-payments.ts` and the bridge-stablecoin skill).
 */
export function BridgeStepTimeline({
  steps,
  sourceLabel = "source chain",
  settleState = "idle",
  receiptState = "idle",
  className = "",
}: {
  steps: Partial<
    Record<BridgeStepName, { state: BridgeStepState; txHash?: string; explorerUrl?: string; error?: string }>
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
    <div className={`rounded-[18px] border border-white/10 bg-white/[0.025] p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="mono-label text-[10px]">Bridge timeline</p>
        <span className="text-[11px] font-medium text-white/38">
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
                  className={`absolute left-[13px] top-7 h-[calc(100%-12px)] w-px ${
                    state === "success" ? "bg-lime/40" : "bg-white/8"
                  }`}
                />
              )}
              <span
                className={`relative grid size-7 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${dotClasses(state)}`}
              >
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

              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-[13px] font-semibold ${textClasses(state)}`}>{stage.label}</p>
                  {meta?.txHash && meta.explorerUrl && (
                    <a
                      href={meta.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-white/55 transition hover:text-white"
                    >
                      View tx
                      <ArrowUpRight className="size-3" />
                    </a>
                  )}
                </div>
                <p
                  className={`mt-1 text-[11.5px] leading-5 ${
                    state === "idle" ? "text-white/35" : "text-white/55"
                  }`}
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
