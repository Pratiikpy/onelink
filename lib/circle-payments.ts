"use client";

import type { Connector } from "wagmi";
import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  parseUnits,
  type Address,
  type Chain,
  type EIP1193Provider,
  type Hex,
} from "viem";
import type { SourceChain } from "@/lib/arc";
import { ARC_CHAIN } from "@/lib/arc";
import {
  createGatewayBurnIntent,
  GATEWAY_EVM_TESTNET_SOURCES,
  GATEWAY_MINTER_ADDRESS,
  gatewayBurnIntentTypedData,
  gatewayMinterAbi,
  type GatewayBalance,
  type GatewayBurnIntent,
  type GatewaySource,
} from "@/lib/gateway";

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

export type GatewayStepName = "balance" | "sign" | "transfer" | "mint";

export type GatewayStepUpdate = {
  step: GatewayStepName;
  state: BridgeStepState;
  sourceLabel?: string;
  txHash?: Hex;
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

async function ensureWalletChain(provider: EIP1193Provider, chain: Chain) {
  const chainIdHex = `0x${chain.id.toString(16)}`;
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch {
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainIdHex,
          chainName: chain.name,
          nativeCurrency: chain.nativeCurrency,
          rpcUrls: chain.rpcUrls.default.http,
          blockExplorerUrls: chain.blockExplorers?.default?.url ? [chain.blockExplorers.default.url] : [],
        },
      ],
    });
  }
}

function bigintJson(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

async function gatewayBalances(depositor: Address) {
  const response = await fetch("/api/gateway/balances", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ depositor }),
  });
  const payload = (await response.json().catch(() => null)) as
    | { balances?: GatewayBalance[]; error?: string }
    | null;
  if (!response.ok) {
    throw new Error(payload?.error || "Circle Gateway balance lookup failed.");
  }
  return payload?.balances ?? [];
}

function balanceForSource(balances: GatewayBalance[], source: GatewaySource) {
  const match = balances.find((balance) => balance.domain === source.domain);
  return match?.balance ?? "0";
}

function selectGatewaySource({
  balances,
  amount,
  preferredChainId,
}: {
  balances: GatewayBalance[];
  amount: bigint;
  preferredChainId?: number;
}) {
  const nonArcSources = GATEWAY_EVM_TESTNET_SOURCES.filter((source) => source.chain.id !== ARC_CHAIN.id);
  const preferred = preferredChainId
    ? nonArcSources.find((source) => source.chain.id === preferredChainId)
    : undefined;
  const ordered = preferred ? [preferred, ...nonArcSources.filter((source) => source !== preferred)] : nonArcSources;
  return ordered.find((source) => parseUnits(balanceForSource(balances, source), 6) >= amount);
}

type GatewayTransferResponse = {
  attestation?: Hex;
  signature?: Hex;
};

async function requestGatewayTransfer(burnIntent: GatewayBurnIntent, signature: Hex) {
  const response = await fetch("/api/gateway/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ burnIntent, signature }, bigintJson),
  });
  const payload = (await response.json().catch(() => null)) as
    | GatewayTransferResponse
    | GatewayTransferResponse[]
    | { error?: string; details?: unknown }
    | null;
  if (!response.ok) {
    const errorPayload = payload as { error?: string } | null;
    throw new Error(errorPayload?.error || "Circle Gateway transfer failed.");
  }
  const transfer = Array.isArray(payload) ? payload[0] : (payload as GatewayTransferResponse | null);
  if (!transfer?.attestation || !transfer.signature) {
    throw new Error("Circle Gateway did not return a mint attestation.");
  }
  return { attestation: transfer.attestation, signature: transfer.signature };
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
  preferredSourceChainId,
  onStep,
}: {
  connector: Connector;
  amount: string;
  recipient: Address;
  preferredSourceChainId?: number;
  onStep?: (update: GatewayStepUpdate) => void;
}) {
  if (!ENABLE_GATEWAY_ROUTE) {
    throw new Error("Circle Gateway payment is not enabled until a funded route has been verified.");
  }
  const provider = (await connector.getProvider()) as EIP1193Provider;
  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as Address[];
  const account = accounts[0];
  if (!account) throw new Error("No wallet account returned.");

  const amountUnits = parseUnits(amount, 6);
  onStep?.({ step: "balance", state: "active" });
  const balances = await gatewayBalances(account);
  const source = selectGatewaySource({ balances, amount: amountUnits, preferredChainId: preferredSourceChainId });
  if (!source) {
    onStep?.({ step: "balance", state: "error" });
    const total = balances.reduce((sum, balance) => sum + Number(balance.balance || 0), 0);
    throw new Error(
      `Gateway balance is ${total.toFixed(6)} USDC across supported non-Arc sources. Deposit USDC into Gateway before using Unified.`,
    );
  }
  onStep?.({ step: "balance", state: "success", sourceLabel: source.label });

  await ensureWalletChain(provider, source.chain);
  const sourceWalletClient = createWalletClient({
    account,
    chain: source.chain,
    transport: custom(provider),
  });
  const burnIntent = createGatewayBurnIntent({
    source,
    amount: amountUnits,
    depositor: account,
    recipient,
  });

  onStep?.({ step: "sign", state: "active", sourceLabel: source.label });
  const signature = await sourceWalletClient.signTypedData({
    ...gatewayBurnIntentTypedData,
    message: burnIntent,
  });
  onStep?.({ step: "sign", state: "success", sourceLabel: source.label });

  onStep?.({ step: "transfer", state: "active", sourceLabel: source.label });
  const transfer = await requestGatewayTransfer(burnIntent, signature);
  onStep?.({ step: "transfer", state: "success", sourceLabel: source.label });

  await ensureWalletChain(provider, ARC_CHAIN);
  const destinationWalletClient = createWalletClient({
    account,
    chain: ARC_CHAIN,
    transport: custom(provider),
  });
  const destinationPublicClient = createPublicClient({
    chain: ARC_CHAIN,
    transport: custom(provider),
  });
  const gatewayMinter = getContract({
    address: GATEWAY_MINTER_ADDRESS,
    abi: gatewayMinterAbi,
    client: destinationWalletClient,
  });

  onStep?.({ step: "mint", state: "active", sourceLabel: source.label });
  const mintTx = await gatewayMinter.write.gatewayMint([transfer.attestation, transfer.signature], {
    account,
  });
  const receipt = await destinationPublicClient.waitForTransactionReceipt({ hash: mintTx });
  if (receipt.status !== "success") {
    onStep?.({ step: "mint", state: "error", sourceLabel: source.label, txHash: mintTx });
    throw new Error("Gateway mint on Arc failed.");
  }
  onStep?.({ step: "mint", state: "success", sourceLabel: source.label, txHash: mintTx });

  return { state: "success", source, mintTx };
}
