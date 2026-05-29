"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowRight, Check, ChevronRight, ExternalLink, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/onelink/logo";
import { StatusBadge } from "@/components/onelink/status-badge";
import { StepTimeline, type Step } from "@/components/onelink/step-timeline";
import { BottomBar } from "@/components/onelink/bottom-bar";
import {
  ARC_CHAIN_ID,
  ARC_FAUCET_URL,
  ARC_USDC_ADDRESS,
  getSourceChain,
  SUPPORTED_SOURCE_CHAINS,
} from "@/lib/arc";
import {
  bridgeUsdcToArc,
  ENABLE_GATEWAY_ROUTE,
  spendGatewayBalanceOnArc,
  type BridgeStepName,
  type BridgeStepState,
  type GatewayStepName,
} from "@/lib/circle-payments";
import {
  ALLOW_DEMO_MODE,
  erc20Abi,
  HAS_CONTRACT,
  ONELINK_CONTRACT_ADDRESS,
  oneLinkCollectAbi,
} from "@/lib/contracts";
import {
  amountToUnits,
  paymentPath,
  receiptPath,
  type PaymentLink,
} from "@/lib/payments";
import { friendlyError } from "@/lib/errors";
import { shareOrCopy, useCopy } from "@/lib/share";
import {
  confirmPaidSettlement,
  getPaymentLinkBySlug,
  updatePaymentStatus,
} from "@/lib/storage";
import { formatUSDC, relativeTime, truncateAddr } from "@/lib/format";
import { cn } from "@/lib/utils";

type QuickRoute = "arc-direct" | "app-kit-bridge" | "unified-balance";
type ArcStepName = "switch" | "approve" | "settle" | "verify";
type ArcStepState = "active" | "success" | "error";

const provenBridgeSource = SUPPORTED_SOURCE_CHAINS[0];

const availableRoutes: QuickRoute[] = ENABLE_GATEWAY_ROUTE
  ? ["arc-direct", "app-kit-bridge", "unified-balance"]
  : ["arc-direct", "app-kit-bridge"];

function makeDemoPayLink(slug: string): PaymentLink {
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + 7);
  return {
    id: `demo-${slug || "pay"}`,
    slug: slug || "demo-link",
    creatorWallet: "0x7a3F9b2C8d4E1f6A0B5c2D8e9F3a4B5c7D2f3F2A",
    recipientWallet: "0x7a3F9b2C8d4E1f6A0B5c2D8e9F3a4B5c7D2f3F2A",
    amountUSDC: "250.00",
    memo: "Branding sprint — Q2 final",
    status: "unpaid",
    expiresAt: expires.toISOString(),
    contractLinkId:
      "0x1111111111111111111111111111111111111111111111111111111111111111",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function PayLinkClient({ slug }: { slug: string }) {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const arcClient = usePublicClient({ chainId: ARC_CHAIN_ID });
  const router = useRouter();

  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activity, setActivity] = useState("");
  const [route, setRoute] = useState<QuickRoute>("arc-direct");
  const { copied, copy } = useCopy();
  const paidToastFiredFor = useRef<string | null>(null);

  const [bridgeSteps, setBridgeSteps] = useState<
    Partial<
      Record<
        BridgeStepName,
        { state: BridgeStepState; txHash?: string; explorerUrl?: string; error?: string }
      >
    >
  >({});
  const [gatewaySteps, setGatewaySteps] = useState<
    Partial<
      Record<
        GatewayStepName,
        { state: BridgeStepState; sourceLabel?: string; txHash?: string; error?: string }
      >
    >
  >({});
  const [arcSteps, setArcSteps] = useState<
    Partial<Record<ArcStepName, { state: ArcStepState; txHash?: string }>>
  >({});
  const [justSettled, setJustSettled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const saved = await getPaymentLinkBySlug(slug);
        if (cancelled) return;
        const canShowDemo =
          ALLOW_DEMO_MODE || !process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://");
        setLink(saved ?? (canShowDemo ? makeDemoPayLink(slug) : null));
      } catch (err) {
        if (cancelled) return;
        setLink(null);
        setError(err instanceof Error ? err.message : "Could not load this payment link.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const { data: usdcBalance } = useBalance({
    address,
    token: ARC_USDC_ADDRESS,
    chainId: ARC_CHAIN_ID,
    query: { enabled: Boolean(address) },
  });

  // After a settlement completes THIS session, celebrate and auto-route to the
  // receipt (the manual CTA stays as a fallback). `justSettled` gates this so it
  // never fires when merely viewing an already-paid link.
  useEffect(() => {
    if (!justSettled || link?.status !== "paid" || !link.id) return;
    if (paidToastFiredFor.current === link.id) return;
    paidToastFiredFor.current = link.id;
    toast.success("Payment complete — receipt ready");
    const dest = receiptPath(link.id);
    const t = setTimeout(() => router.push(dest), 1800);
    return () => clearTimeout(t);
  }, [justSettled, link?.id, link?.status, router]);

  const amountNumber = link ? Number(link.amountUSDC) : 0;
  const balanceNumber = usdcBalance ? Number(usdcBalance.formatted) : 0;
  const isExpired = useMemo(() => {
    if (!link?.expiresAt) return false;
    return Date.now() > new Date(link.expiresAt).getTime();
  }, [link]);
  const isClosed =
    link?.status === "paid" || link?.status === "cancelled" || isExpired;

  async function settleOnArc(method: "arc-direct" | "app-kit-bridge" | "unified-balance" | "demo") {
    if (!link || !address) return;
    const markArc = (key: ArcStepName, state: ArcStepState, txHash?: string) =>
      setArcSteps((cur) => ({ ...cur, [key]: { state, txHash } }));
    if (HAS_CONTRACT) {
      if (!arcClient) throw new Error("Arc RPC client is not available.");
      markArc("switch", "active");
      setActivity("Switching to Arc...");
      await switchChainAsync({ chainId: ARC_CHAIN_ID });
      markArc("switch", "success");

      markArc("approve", "active");
      setActivity("Approving Arc USDC...");
      const approveHash = await writeContractAsync({
        address: ARC_USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [ONELINK_CONTRACT_ADDRESS, amountToUnits(link.amountUSDC)],
      });
      const approveReceipt = await arcClient.waitForTransactionReceipt({ hash: approveHash });
      if (approveReceipt.status !== "success") {
        markArc("approve", "error");
        throw new Error("USDC approval failed on Arc.");
      }
      markArc("approve", "success", approveHash);

      markArc("settle", "active");
      setActivity("Submitting Arc settlement...");
      const payHash =
        link.settlementMode === "profile"
          ? await writeContractAsync({
              address: ONELINK_CONTRACT_ADDRESS,
              abi: oneLinkCollectAbi,
              functionName: "payRecipient",
              args: [link.contractLinkId, link.recipientWallet, amountToUnits(link.amountUSDC)],
            })
          : await writeContractAsync({
              address: ONELINK_CONTRACT_ADDRESS,
              abi: oneLinkCollectAbi,
              functionName: "payLink",
              args: [link.contractLinkId],
            });
      const receipt = await arcClient.waitForTransactionReceipt({ hash: payHash });
      if (receipt.status !== "success") {
        markArc("settle", "error");
        throw new Error("Arc settlement transaction failed.");
      }
      markArc("settle", "success", payHash);

      markArc("verify", "active");
      const paid = await confirmPaidSettlement(link.id, {
        txHash: payHash,
        payerWallet: address,
        paymentMethod: method,
        sourceChain: method === "arc-direct" ? "Arc_Testnet" : "Bridged",
      });
      markArc("verify", "success");
      if (paid) setLink(paid);
      setJustSettled(true);
      setActivity("Settled on Arc.");
      return;
    }

    setActivity("Recording demo settlement...");
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
    setJustSettled(true);
  }

  async function pay() {
    setError("");
    setActivity("");
    setBridgeSteps({});
    setGatewaySteps({});
    setArcSteps({});
    setJustSettled(false);
    if (!isConnected || !address) return;
    if (!link) return;
    if (isExpired) {
      setError("This payment link is expired.");
      return;
    }

    setBusy(true);
    try {
      if (!HAS_CONTRACT) {
        await settleOnArc("demo");
        return;
      }
      if (route === "arc-direct") {
        const processing = await updatePaymentStatus(link.id, "processing", {
          payerWallet: address,
          paymentMethod: "arc-direct",
          sourceChain: "Arc_Testnet",
        });
        if (processing) setLink(processing);
        await settleOnArc("arc-direct");
      } else if (route === "app-kit-bridge") {
        if (!connector) throw new Error("Wallet connector missing.");
        const source = getSourceChain(chainId);
        if (!source) {
          throw new Error("Select a supported testnet source chain. Base Sepolia is the verified bridge route.");
        }
        const processing = await updatePaymentStatus(link.id, "processing", {
          payerWallet: address,
          paymentMethod: "app-kit-bridge",
          sourceChain: source.appKitName,
        });
        if (processing) setLink(processing);
        setActivity(`Bridging USDC from ${source.label} to Arc...`);
        await bridgeUsdcToArc({
          connector,
          source,
          amount: link.amountUSDC,
          recipient: address,
          onStep: (u) =>
            setBridgeSteps((cur) => ({
              ...cur,
              [u.step]: { state: u.state, txHash: u.txHash, explorerUrl: u.explorerUrl, error: u.error },
            })),
        });
        await settleOnArc("app-kit-bridge");
      } else if (route === "unified-balance") {
        if (!connector) throw new Error("Wallet connector missing.");
        const processing = await updatePaymentStatus(link.id, "processing", {
          payerWallet: address,
          paymentMethod: "unified-balance",
          sourceChain: "Gateway_Unified_Testnet",
        });
        if (processing) setLink(processing);
        setActivity("Spending Gateway unified balance to Arc...");
        await spendGatewayBalanceOnArc({
          connector,
          amount: link.amountUSDC,
          recipient: address,
          preferredSourceChainId: chainId,
          onStep: (u) =>
            setGatewaySteps((cur) => ({
              ...cur,
              [u.step]: { state: u.state, sourceLabel: u.sourceLabel, txHash: u.txHash, error: u.error },
            })),
        });
        await settleOnArc("unified-balance");
      }
    } catch (err) {
      if (link && HAS_CONTRACT) {
        const failed = await updatePaymentStatus(link.id, "failed", {
          payerWallet: address,
          paymentMethod: route,
          sourceChain: route === "unified-balance" ? "Gateway_Unified_Testnet" : getSourceChain(chainId)?.appKitName,
        });
        if (failed) setLink(failed);
      }
      setActivity("");
      setError(friendlyError(err, { route }));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-hairline">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
            <Logo />
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              What is OneLink?
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-md px-6 py-14" aria-busy="true">
          <span className="sr-only">Loading payment link</span>
          {/* Recipient row */}
          <div className="mb-7 flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
            <div className="space-y-2">
              <div className="h-3.5 w-40 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-hairline bg-surface p-7">
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-20 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
            </div>
            {/* Amount */}
            <div className="mt-6 h-14 w-52 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
            {/* Memo lines */}
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            </div>
            {/* Route selector */}
            <div className="mt-6 h-12 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
            {/* Action button */}
            <div className="mt-5 h-11 w-full animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
          </div>
        </main>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Payment link
        </p>
        <h1 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em]">
          {error ? "Could not load link" : "Link not found"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {error || "Ask the sender for a fresh OneLink URL."}
        </p>
        <div className="mt-7 flex justify-center">
          <Button asChild size="lg">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const missingDirect = Math.max(0, amountNumber - balanceNumber);
  const paymentUrl =
    typeof window === "undefined"
      ? paymentPath(link.slug)
      : `${window.location.origin}${paymentPath(link.slug)}`;

  // Live timeline (only shown for active bridge/gateway flows)
  const bridgeTimeline: Step[] = (
    ["approve", "burn", "fetchAttestation", "mint"] as BridgeStepName[]
  ).map((k) => {
    const meta = bridgeSteps[k];
    const state = meta?.state ?? "pending";
    return {
      key: k,
      label:
        k === "approve"
          ? "Approve USDC"
          : k === "burn"
          ? "Burn on source"
          : k === "fetchAttestation"
          ? "Circle attestation"
          : "Mint on Arc",
      detail:
        k === "approve"
          ? "ERC-20 allowance for CCTP"
          : k === "burn"
          ? "USDC destroyed on source chain"
          : k === "fetchAttestation"
          ? "Circle IRIS signs the burn"
          : "USDC arrives on Arc",
      hash: meta?.txHash,
      status:
        state === "success"
          ? "done"
          : state === "active"
          ? "active"
          : state === "error"
          ? "failed"
          : "pending",
    };
  });

  const gatewayTimeline: Step[] = (
    ["balance", "sign", "transfer", "mint"] as GatewayStepName[]
  ).map((k) => {
    const meta = gatewaySteps[k];
    const state = meta?.state ?? "pending";
    return {
      key: k,
      label:
        k === "balance"
          ? "Find Gateway balance"
          : k === "sign"
          ? "Sign burn intent"
          : k === "transfer"
          ? "Gateway attestation"
          : "Mint on Arc",
      detail: meta?.sourceLabel
        ? `${meta.sourceLabel} → Arc Testnet`
        : k === "balance"
        ? "Across deposited testnet sources"
        : k === "sign"
        ? "EIP-712 burn intent"
        : k === "transfer"
        ? "Circle Gateway returns mint attestation"
        : "Gateway Minter releases USDC on Arc",
      status:
        state === "success"
          ? "done"
          : state === "active"
          ? "active"
          : state === "error"
          ? "failed"
          : "pending",
    };
  });

  const arcTimeline: Step[] = (
    ["switch", "approve", "settle", "verify"] as ArcStepName[]
  ).map((k) => {
    const meta = arcSteps[k];
    const state = meta?.state ?? "pending";
    return {
      key: k,
      label:
        k === "switch"
          ? "Switch to Arc Testnet"
          : k === "approve"
          ? "Approve Arc USDC"
          : k === "settle"
          ? "Settle on Arc"
          : "Server-verify receipt",
      detail:
        k === "switch"
          ? `Wallet network → Arc · chain ${ARC_CHAIN_ID}`
          : k === "approve"
          ? "ERC-20 allowance for OneLinkCollect"
          : k === "settle"
          ? "payLink / payRecipient settles on Arc"
          : "Matched to the on-chain PaymentCompleted event",
      hash: meta?.txHash,
      status:
        state === "success"
          ? "done"
          : state === "active"
          ? "active"
          : state === "error"
          ? "failed"
          : "pending",
    };
  });

  // Single source for the primary action so the desktop inline button and the
  // mobile sticky BottomBar never drift.
  const renderAction = () =>
    !isConnected ? (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <Button onClick={openConnectModal} variant="brand" size="lg" className="w-full">
            <Wallet className="h-4 w-4" /> Connect wallet
          </Button>
        )}
      </ConnectButton.Custom>
    ) : (
      <Button
        onClick={pay}
        variant="brand"
        size="lg"
        className="w-full"
        loading={busy}
        disabled={
          isClosed ||
          (route === "arc-direct" && !!usdcBalance && missingDirect > 0)
        }
      >
        {route === "arc-direct"
          ? `Pay ${formatUSDC(link.amountUSDC)} USDC on Arc`
          : route === "app-kit-bridge"
          ? "Bridge & pay"
          : "Pay with unified balance"}
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

  return (
    <div className="min-h-screen bg-background page-in">
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <Logo />
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            What is OneLink?
          </Link>
        </div>
      </header>

      <main className={cn("mx-auto max-w-md px-6 pt-14 pb-14", !isClosed && "pb-28 md:pb-14")}>
        <div className="mb-7 flex items-center gap-3 text-sm">
          <span
            className="grid h-10 w-10 place-items-center rounded-full text-background font-display text-sm font-semibold"
            style={{
              background:
                "conic-gradient(from 200deg, oklch(0.16 0.004 260), oklch(0.42 0.06 158), oklch(0.16 0.004 260))",
            }}
          >
            {(link.recipientWallet[2] ?? "P").toUpperCase()}
          </span>
          <div>
            <p className="font-medium">
              {truncateAddr(link.recipientWallet)}{" "}
              <span className="text-muted-foreground">requested</span>
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">Arc Testnet</p>
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-7 card-lift">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Amount due
            </span>
            <StatusBadge status={link.status} />
          </div>
          <p className="mt-6 flex items-baseline gap-2 font-display text-[64px] font-semibold leading-none tracking-[-0.045em] tabular-nums">
            <span>{formatUSDC(link.amountUSDC)}</span>
            <span className="text-lg font-medium tracking-tight text-muted-foreground">
              USDC
            </span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground break-words">{link.memo}</p>
          {link.expiresAt && link.status === "unpaid" && !isExpired && (
            <p className="mt-4 text-xs text-muted-foreground">
              Expires {relativeTime(link.expiresAt)}
            </p>
          )}

          {/* States */}
          {isClosed && link.status === "paid" && (
            <div className="mt-7 flex flex-col items-center text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-success text-success-foreground animate-in zoom-in-50 duration-300 motion-reduce:animate-none">
                <Check className="h-7 w-7" />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold tracking-[-0.02em]">
                Payment complete
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                You paid {formatUSDC(link.amountUSDC)} USDC to{" "}
                {truncateAddr(link.recipientWallet)}
              </p>
              <div className="mt-6 w-full">
                <Button asChild size="lg" className="w-full">
                  <Link href={receiptPath(link.id)}>
                    View receipt <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                {justSettled && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Taking you to your receipt…
                  </p>
                )}
              </div>
            </div>
          )}
          {isClosed && link.status === "cancelled" && (
            <Notice title="Cancelled by the creator" desc="This payment is no longer accepting funds." />
          )}
          {isClosed && link.status !== "paid" && link.status !== "cancelled" && isExpired && (
            <Notice title="This link has expired" desc="Ask the creator to issue a new one." />
          )}
          {link.status === "failed" && !isClosed && (
            <Notice tone="error" title="Last attempt failed" desc="You can try again." />
          )}

          {!isClosed && (
            <>
              {/* Route selector */}
              <div className="mt-6 grid grid-cols-3 gap-1 rounded-lg border border-hairline bg-background p-1">
                {(
                  [
                    ["arc-direct", "Arc"],
                    ["app-kit-bridge", "Bridge"],
                    ["unified-balance", "Gateway"],
                  ] as const
                ).map(([k, l]) => {
                  const enabled = availableRoutes.includes(k) && !busy;
                  return (
                    <button
                      key={k}
                      type="button"
                      disabled={!enabled}
                      aria-pressed={route === k}
                      onClick={() => {
                        if (!enabled) return;
                        if (k !== route) {
                          setBridgeSteps({});
                          setGatewaySteps({});
                          setError("");
                          setActivity("");
                        }
                        setRoute(k);
                      }}
                      className={cn(
                        "rounded-md px-3 py-2 text-xs font-medium transition-colors",
                        route === k
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground",
                        !enabled && "cursor-not-allowed opacity-40",
                      )}
                    >
                      {l}
                      {k === "unified-balance" && !ENABLE_GATEWAY_ROUTE && (
                        <span className="ml-1 text-[9px] uppercase tracking-wider text-muted-foreground/60">
                          gated
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pre-flight */}
              <div className="mt-4 space-y-1.5">
                <Pre
                  ok={chainId === ARC_CHAIN_ID || route !== "arc-direct"}
                  label={
                    route === "arc-direct"
                      ? chainId === ARC_CHAIN_ID
                        ? "Wallet on Arc Testnet"
                        : "Wallet will switch to Arc Testnet"
                      : route === "app-kit-bridge"
                      ? `Source: ${getSourceChain(chainId)?.label ?? "switch to Base Sepolia"}`
                      : "Gateway: any deposited source"
                  }
                />
                <Pre
                  ok={
                    !isConnected ||
                    route !== "arc-direct" ||
                    !usdcBalance ||
                    missingDirect <= 0
                  }
                  label={
                    !isConnected
                      ? "Connect wallet to check balance"
                      : route === "arc-direct"
                      ? missingDirect > 0
                        ? `Need ${missingDirect.toFixed(2)} more Arc USDC`
                        : "Arc USDC balance sufficient"
                      : "Balance fetched on submit"
                  }
                  action={route === "arc-direct" && missingDirect > 0 ? "Faucet" : undefined}
                  href={ARC_FAUCET_URL}
                />
                <Pre ok label="USDC is the gas token on Arc — no ETH required" />
                <Pre
                  ok
                  label={
                    HAS_CONTRACT
                      ? "Receipt is server-verified before final state"
                      : "Demo mode — illustrative receipt, no on-chain settlement"
                  }
                />
              </div>

              {/* Status / activity / error */}
              {activity && (
                <p
                  role="status"
                  aria-live="polite"
                  className="mt-4 text-xs text-success"
                >
                  {activity}
                </p>
              )}
              {error && (
                <p role="alert" className="mt-4 text-xs text-destructive">
                  {error}
                </p>
              )}

              {/* Action — inline on desktop; mobile uses the sticky BottomBar */}
              <div className="mt-5 hidden md:block">{renderAction()}</div>
            </>
          )}
        </div>

        {/* Live timelines */}
        {!isClosed &&
          HAS_CONTRACT &&
          route === "arc-direct" &&
          (busy || Object.keys(arcSteps).length > 0) && (
            <div className="mt-6 rounded-2xl border border-hairline bg-surface p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Arc settlement timeline
              </p>
              <div className="mt-5">
                <StepTimeline steps={arcTimeline} />
              </div>
            </div>
          )}
        {!isClosed &&
          route === "app-kit-bridge" &&
          (busy || Object.keys(bridgeSteps).length > 0) && (
            <div className="mt-6 rounded-2xl border border-hairline bg-surface p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Bridge timeline · {provenBridgeSource.label} → Arc
              </p>
              <div className="mt-5">
                <StepTimeline steps={bridgeTimeline} />
              </div>
            </div>
          )}
        {!isClosed &&
          route === "unified-balance" &&
          (busy || Object.keys(gatewaySteps).length > 0) && (
            <div className="mt-6 rounded-2xl border border-hairline bg-surface p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Gateway timeline
              </p>
              <div className="mt-5">
                <StepTimeline steps={gatewayTimeline} />
              </div>
            </div>
          )}

        {/* Share */}
        {link.status === "unpaid" && !isExpired && (
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => copy(paymentUrl)}
            >
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                const result = await shareOrCopy({
                  title: `Pay ${link.amountUSDC} USDC with OneLink`,
                  text: link.memo,
                  url: paymentUrl,
                });
                if (result === "failed") toast.error("Couldn't share");
              }}
            >
              Share
            </Button>
          </div>
        )}

        <Link
          href="/security"
          className="mt-6 inline-flex w-full items-center justify-center text-[11px] text-muted-foreground hover:text-foreground"
        >
          Verification scope and testnet boundaries →
        </Link>
      </main>

      {!isClosed && <BottomBar>{renderAction()}</BottomBar>}
    </div>
  );
}

function Pre({
  ok,
  label,
  action,
  href,
}: {
  ok: boolean;
  label: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-hairline bg-background px-3 py-2 text-xs">
      <span className="inline-flex items-center gap-2">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            ok ? "bg-success" : "bg-warning",
          )}
        />
        {label}
      </span>
      {action && href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-2 hover:underline"
        >
          {action} <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

function Notice({
  title,
  desc,
  tone = "muted",
}: {
  title: string;
  desc: string;
  tone?: "muted" | "error";
}) {
  return (
    <div
      className={cn(
        "mt-6 flex items-start gap-3 rounded-md border p-3 text-sm",
        tone === "error"
          ? "border-destructive/20 bg-destructive/[0.05] text-destructive"
          : "border-hairline bg-muted text-muted-foreground",
      )}
    >
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
