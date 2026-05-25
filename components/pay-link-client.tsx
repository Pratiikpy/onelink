"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount, useBalance, useChainId, useSwitchChain, useWriteContract } from "wagmi";
import type { EIP1193Provider } from "viem";
import type { BridgeParams, SpendParams } from "@circle-fin/app-kit";
import { ArrowRight, BadgeCheck, Cable, ExternalLink, Loader2, WalletCards } from "lucide-react";
import { Card, Button, Pill } from "@/components/ui";
import { PaymentSummaryCard } from "@/components/payment-card";
import { ARC_CHAIN_ID, ARC_USDC_ADDRESS, SUPPORTED_SOURCE_CHAINS, explorerTx } from "@/lib/arc";
import {
  erc20Abi,
  HAS_CONTRACT,
  ONELINK_CONTRACT_ADDRESS,
  oneLinkCollectAbi,
} from "@/lib/contracts";
import { amountToUnits, shortAddress, type PaymentLink, type PaymentMethod } from "@/lib/payments";
import { getPaymentLinkBySlug, updatePaymentStatus } from "@/lib/storage";

type AppKitBridgeChain = "Arc_Testnet" | "Base_Sepolia" | "Ethereum_Sepolia" | "Arbitrum_Sepolia";

type Step = {
  label: string;
  state: "idle" | "active" | "done" | "failed";
};

const initialSteps: Step[] = [
  { label: "Approve", state: "idle" },
  { label: "Move USDC", state: "idle" },
  { label: "Settle on Arc", state: "idle" },
  { label: "Receipt", state: "idle" },
];

export function PayLinkClient({ slug }: { slug: string }) {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [steps, setSteps] = useState(initialSteps);
  const [method, setMethod] = useState<PaymentMethod>("arc-direct");

  const { data: usdcBalance } = useBalance({
    address,
    token: ARC_USDC_ADDRESS,
    chainId: ARC_CHAIN_ID,
    query: { enabled: Boolean(address) },
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLink(await getPaymentLinkBySlug(slug));
      setLoading(false);
    }
    load();
  }, [slug]);

  const isExpired = useMemo(() => {
    if (!link?.expiresAt) return false;
    return Date.now() > new Date(link.expiresAt).getTime();
  }, [link]);

  const balanceNumber = usdcBalance ? Number(usdcBalance.formatted) : 0;
  const amountNumber = link ? Number(link.amountUSDC) : 0;
  const insufficient =
    isConnected && Number.isFinite(balanceNumber) && balanceNumber < amountNumber;
  const wrongChain = isConnected && chainId !== ARC_CHAIN_ID;

  function setStep(index: number, state: Step["state"]) {
    setSteps((current) =>
      current.map((step, stepIndex) => (stepIndex === index ? { ...step, state } : step)),
    );
  }

  async function settleOnArc(selectedMethod: PaymentMethod) {
    if (!link || !address) return;

    if (HAS_CONTRACT) {
      setStep(0, "active");
      await switchChainAsync({ chainId: ARC_CHAIN_ID });
      const approvalHash = await writeContractAsync({
        address: ARC_USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [ONELINK_CONTRACT_ADDRESS, amountToUnits(link.amountUSDC)],
      });
      setStep(0, "done");

      setStep(2, "active");
      const payHash = await writeContractAsync({
        address: ONELINK_CONTRACT_ADDRESS,
        abi: oneLinkCollectAbi,
        functionName: "payLink",
        args: [link.contractLinkId],
      });
      setStep(2, "done");
      setStep(3, "done");

      const paid = await updatePaymentStatus(link.id, "paid", {
        txHash: payHash,
        payerWallet: address,
        paymentMethod: selectedMethod,
        sourceChain: selectedMethod === "arc-direct" ? "Arc_Testnet" : "Bridged",
      });
      if (paid) setLink(paid);
      console.info("USDC approval tx", approvalHash);
    } else {
      setStep(0, "done");
      setStep(2, "active");
      await new Promise((resolve) => setTimeout(resolve, 900));
      setStep(2, "done");
      setStep(3, "done");

      // Demo tx hashes are tagged 0xDEM0… so they are never mistaken for an
      // on-chain settlement in receipts or copy/paste workflows.
      const demoSuffix = crypto
        .randomUUID()
        .replaceAll("-", "")
        .toUpperCase()
        .slice(0, 60)
        .padEnd(60, "0");
      const paid = await updatePaymentStatus(link.id, "paid", {
        txHash: `0xDEM0${demoSuffix}` as `0x${string}`,
        payerWallet: address,
        paymentMethod: "demo",
        sourceChain: "Arc_Testnet demo",
      });
      if (paid) setLink(paid);
    }
  }

  async function payDirect() {
    setError("");
    if (!isConnected || !address) {
      setError("Connect a wallet first.");
      return;
    }
    if (!link) return;
    if (isExpired) {
      setError("This payment link is expired.");
      return;
    }

    setBusy(true);
    setSteps(initialSteps);
    try {
      await settleOnArc("arc-direct");
    } catch (err) {
      setStep(2, "failed");
      setError(err instanceof Error ? err.message : "Arc payment failed.");
    } finally {
      setBusy(false);
    }
  }

  async function bridgeAndPay(sourceChainId: number, sourceChain: AppKitBridgeChain) {
    setError("");
    if (!connector || !address || !link) {
      setError("Connect a wallet first.");
      return;
    }

    setBusy(true);
    setSteps(initialSteps);
    setMethod("app-kit-bridge");
    try {
      setStep(0, "active");
      if (chainId !== sourceChainId) {
        await switchChainAsync({ chainId: sourceChainId });
      }
      const provider = (await connector.getProvider()) as EIP1193Provider;
      const [{ AppKit }, { createViemAdapterFromProvider }] = await Promise.all([
        import("@circle-fin/app-kit"),
        import("@circle-fin/adapter-viem-v2"),
      ]);
      const kit = new AppKit();
      const adapter = await createViemAdapterFromProvider({ provider });
      setStep(0, "done");
      setStep(1, "active");

      const bridgeParams: BridgeParams = {
        from: { adapter, chain: sourceChain },
        to: { adapter, chain: "Arc_Testnet", useForwarder: true },
        amount: link.amountUSDC,
        token: "USDC",
      };
      await kit.bridge(bridgeParams);

      setStep(1, "done");
      await settleOnArc("app-kit-bridge");
    } catch (err) {
      setStep(1, "failed");
      setError(err instanceof Error ? err.message : "Bridge and pay failed.");
    } finally {
      setBusy(false);
    }
  }

  async function spendUnifiedBalance() {
    setError("");
    if (!connector || !address || !link) {
      setError("Connect a wallet first.");
      return;
    }

    setBusy(true);
    setSteps(initialSteps);
    setMethod("unified-balance");
    try {
      const provider = (await connector.getProvider()) as EIP1193Provider;
      const [{ AppKit }, { createViemAdapterFromProvider }] = await Promise.all([
        import("@circle-fin/app-kit"),
        import("@circle-fin/adapter-viem-v2"),
      ]);
      const kit = new AppKit();
      const adapter = await createViemAdapterFromProvider({ provider });
      setStep(1, "active");

      const spendParams: SpendParams = {
        from: { adapter },
        amount: link.amountUSDC,
        token: "USDC",
        to: {
          adapter,
          chain: "Arc_Testnet",
          recipientAddress: link.recipientWallet,
        },
      };
      await kit.unifiedBalance.spend(spendParams);

      setStep(1, "done");
      await settleOnArc("unified-balance");
    } catch (err) {
      setStep(1, "failed");
      setError(err instanceof Error ? err.message : "Unified Balance spend failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <Loader2 className="mx-auto size-6 animate-spin text-violet" />
        <p className="mt-3 font-bold text-white/60">Loading payment link</p>
      </Card>
    );
  }

  if (!link) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="text-2xl font-black">Link not found</p>
        <p className="mt-2 text-white/50">This request is not in local cache or Supabase.</p>
        <Link href="/">
          <Button className="mt-5">Create a link</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <PaymentSummaryCard link={link} />

      <section className="space-y-4">
        <Card className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white/45">Available on Arc</p>
              <p className="text-4xl font-black">
                {usdcBalance ? Number(usdcBalance.formatted).toFixed(2) : "0.00"}
                <span className="text-lg text-white/42"> USDC</span>
              </p>
            </div>
            <div className="grid size-14 place-items-center rounded-2xl border border-violet/30 bg-violet/10">
              <WalletCards className="size-6 text-violet" />
            </div>
          </div>

          <div className="grid gap-2">
            <Button
              onClick={payDirect}
              disabled={
                busy ||
                link.status === "paid" ||
                link.status === "cancelled" ||
                isExpired ||
                !isConnected ||
                insufficient
              }
              className="w-full"
            >
              {busy && method === "arc-direct" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : link.status === "paid" ? (
                <BadgeCheck className="size-4" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              {link.status === "paid"
                ? "Already paid"
                : link.status === "cancelled"
                  ? "Cancelled by creator"
                  : !isConnected
                    ? "Connect wallet to pay"
                    : insufficient
                      ? `Need ${(amountNumber - balanceNumber).toFixed(2)} more USDC on Arc`
                      : "Pay on Arc"}
            </Button>

            <Button
              variant="secondary"
              onClick={() => bridgeAndPay(84532, "Base_Sepolia")}
              disabled={
                busy ||
                link.status === "paid" ||
                link.status === "cancelled" ||
                isExpired ||
                !isConnected
              }
              className="w-full"
            >
              <Cable className="size-4" />
              Bridge from Base Sepolia & pay
            </Button>

            <Button
              variant="secondary"
              onClick={spendUnifiedBalance}
              disabled={
                busy ||
                link.status === "paid" ||
                link.status === "cancelled" ||
                isExpired ||
                !isConnected
              }
              className="w-full"
            >
              <Cable className="size-4" />
              Pay with Unified Balance
            </Button>
          </div>

          {wrongChain && !insufficient && isConnected && (
            <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm font-semibold text-amber-100">
              Your wallet is on a different chain. Pay-on-Arc will prompt a chain switch before
              sending.
            </div>
          )}

          {insufficient && (
            <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm font-semibold text-amber-100">
              Not enough Arc USDC to pay directly. Use Bridge or Unified Balance, or top up at the
              Circle faucet.
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm font-semibold text-red-200">
              {error}
            </div>
          )}

          {isExpired && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm font-semibold text-red-200">
              This link is expired.
            </div>
          )}

          {link.status === "cancelled" && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm font-semibold text-red-200">
              The creator cancelled this payment link. Reach out to them for a new one.
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-white/38">Flow</p>
            <Pill>{HAS_CONTRACT ? "Contract mode" : "Demo mode"}</Pill>
          </div>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div
                key={step.label}
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3"
              >
                <span
                  className={`grid size-8 place-items-center rounded-xl text-xs font-black ${
                    step.state === "done"
                      ? "bg-mint text-ink"
                      : step.state === "active"
                        ? "bg-violet text-ink"
                        : step.state === "failed"
                          ? "bg-red-300 text-ink"
                          : "bg-white/8 text-white/40"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="font-bold text-white/78">{step.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-white/38">
            Bridge from
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {SUPPORTED_SOURCE_CHAINS.map((chain) => (
              <div
                key={chain.id}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-center"
              >
                <p className="text-sm font-bold text-white/85">{chain.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-medium text-white/40">
            USDC bridged via Circle CCTP, then settled on Arc Testnet.
          </p>
        </Card>

        {link.txHash && (
          <a
            href={explorerTx(link.txHash)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 text-sm font-bold text-violet"
          >
            View final settlement
            <ExternalLink className="size-4" />
          </a>
        )}

        {address && (
          <p className="text-center text-xs font-semibold text-white/35">
            Connected payer · {shortAddress(address)}
          </p>
        )}
      </section>
    </div>
  );
}
