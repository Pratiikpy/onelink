"use client";

import type { Connector } from "wagmi";
import type { Address, EIP1193Provider } from "viem";
import type { SourceChain } from "@/lib/arc";

export const ENABLE_GATEWAY_ROUTE = process.env.NEXT_PUBLIC_ENABLE_GATEWAY === "true";

export type BridgeStepName = "approve" | "burn" | "fetchAttestation" | "mint";
export type BridgeStepState = "pending" | "active" | "success" | "error";

export type BridgeStepUpdate = {
  step: BridgeStepName;
  state: BridgeStepState;
  txHash?: string;
  explorerUrl?: string;
  error?: string;
};

async function connectedAdapter(connector: Connector) {
  const provider = (await connector.getProvider()) as EIP1193Provider;
  const { createViemAdapterFromProvider } = await import("@circle-fin/adapter-viem-v2");
  return createViemAdapterFromProvider({ provider });
}

async function circleKit() {
  const { AppKit } = await import("@circle-fin/app-kit");
  return new AppKit();
}

// Loose payload shape — App Kit emits a discriminated union per event, but we
// only read the fields that exist on every step. Using `unknown` keeps us safe
// even if Circle adds more fields to the payload later.
type BridgeEventPayload = {
  values?: {
    state?: string;
    txHash?: string;
    explorerUrl?: string;
    error?: string;
  };
};

function readPayloadState(payload: BridgeEventPayload): BridgeStepState {
  const raw = payload.values?.state;
  if (raw === "success") return "success";
  if (raw === "error") return "error";
  if (raw === "pending") return "pending";
  return "active";
}

export async function bridgeUsdcToArc({
  connector,
  source,
  amount,
  recipient,
  onStep,
}: {
  connector: Connector;
  source: SourceChain;
  amount: string;
  recipient: Address;
  onStep?: (update: BridgeStepUpdate) => void;
}) {
  const [adapter, kit] = await Promise.all([connectedAdapter(connector), circleKit()]);

  if (onStep) {
    // Mark every step as active in order. Skill: bridge-stablecoin (event handling).
    const subscribe = (step: BridgeStepName) => {
      kit.on(`bridge.${step}` as const, (payload: unknown) => {
        const p = payload as BridgeEventPayload;
        onStep({
          step,
          state: readPayloadState(p),
          txHash: p.values?.txHash,
          explorerUrl: p.values?.explorerUrl,
          error: p.values?.error,
        });
      });
    };
    (["approve", "burn", "fetchAttestation", "mint"] satisfies BridgeStepName[]).forEach(subscribe);
  }

  const result = await kit.bridge({
    from: { adapter, chain: source.appKitName },
    to: { adapter, chain: "Arc_Testnet", recipientAddress: recipient },
    amount,
  });

  if (result.state !== "success") {
    throw new Error("Circle CCTP bridge did not complete. Retry the payment route.");
  }

  return result;
}

export async function spendGatewayBalanceOnArc({
  connector,
  amount,
  recipient,
}: {
  connector: Connector;
  amount: string;
  recipient: Address;
}) {
  if (!ENABLE_GATEWAY_ROUTE) {
    throw new Error("Circle Gateway payment is not enabled until a funded route has been verified.");
  }
  const [adapter, kit] = await Promise.all([connectedAdapter(connector), circleKit()]);
  const balances = await kit.unifiedBalance.getBalances({
    token: "USDC",
    sources: { adapter },
    networkType: "testnet",
  });
  if (Number(balances.totalConfirmedBalance) < Number(amount)) {
    throw new Error(
      `Gateway balance is ${balances.totalConfirmedBalance} USDC. Deposit USDC into Gateway before using Unified.`,
    );
  }

  return kit.unifiedBalance.spend({
    amount,
    token: "USDC",
    from: { adapter },
    to: {
      adapter,
      chain: "Arc_Testnet",
      recipientAddress: recipient,
    },
  });
}
