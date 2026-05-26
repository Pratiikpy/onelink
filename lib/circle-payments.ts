"use client";

import type { Connector } from "wagmi";
import type { Address, EIP1193Provider } from "viem";
import type { SourceChain } from "@/lib/arc";

export const ENABLE_GATEWAY_ROUTE = process.env.NEXT_PUBLIC_ENABLE_GATEWAY === "true";

async function connectedAdapter(connector: Connector) {
  const provider = (await connector.getProvider()) as EIP1193Provider;
  const { createViemAdapterFromProvider } = await import("@circle-fin/adapter-viem-v2");
  return createViemAdapterFromProvider({ provider });
}

async function circleKit() {
  const { AppKit } = await import("@circle-fin/app-kit");
  return new AppKit();
}

export async function bridgeUsdcToArc({
  connector,
  source,
  amount,
  recipient,
}: {
  connector: Connector;
  source: SourceChain;
  amount: string;
  recipient: Address;
}) {
  const [adapter, kit] = await Promise.all([connectedAdapter(connector), circleKit()]);
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
