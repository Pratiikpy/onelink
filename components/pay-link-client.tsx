"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount, useBalance, useChainId, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Check, Copy, LockKeyhole, Route, Share2, ShieldCheck } from "lucide-react";
import { ArcPreFlight } from "@/components/arc-preflight";
import { BridgeStepTimeline } from "@/components/bridge-step-timeline";
import { ARC_CHAIN_ID, ARC_USDC_ADDRESS, getSourceChain, SUPPORTED_SOURCE_CHAINS } from "@/lib/arc";
import {
  bridgeUsdcToArc,
  ENABLE_GATEWAY_ROUTE,
  spendGatewayBalanceOnArc,
  type BridgeStepName,
  type BridgeStepState,
} from "@/lib/circle-payments";
import {
  ALLOW_DEMO_MODE,
  erc20Abi,
  HAS_CONTRACT,
  ONELINK_CONTRACT_ADDRESS,
  oneLinkCollectAbi,
} from "@/lib/contracts";
import { amountToUnits, paymentPath, receiptPath, shortAddress, type PaymentLink } from "@/lib/payments";
import { shareOrCopy, useCopy } from "@/lib/share";
import { confirmPaidSettlement, getPaymentLinkBySlug, updatePaymentStatus } from "@/lib/storage";

type QuickRoute = "arc-direct" | "app-kit-bridge" | "unified-balance";

const availableRoutes: QuickRoute[] = ENABLE_GATEWAY_ROUTE
  ? ["arc-direct", "app-kit-bridge", "unified-balance"]
  : ["arc-direct", "app-kit-bridge"];
const displayRoutes: QuickRoute[] = ["arc-direct", "app-kit-bridge", "unified-balance"];

const provenBridgeSource = SUPPORTED_SOURCE_CHAINS[0];

const routeDetails: Record<
  QuickRoute,
  {
    title: string;
    label: string;
    copy: string;
    badge: string;
    icon: typeof Route;
  }
> = {
  "arc-direct": {
    title: "Pay on Arc",
    label: "Fastest",
    copy: "Use Arc Testnet USDC already in your wallet. Final state is verified on Arc before receipt.",
    badge: "Direct settlement",
    icon: ShieldCheck,
  },
  "app-kit-bridge": {
    title: `Bridge from ${provenBridgeSource.label}`,
    label: "Circle CCTP",
    copy: "Move USDC into Arc through Circle App Kit, then settle the invoice on Arc.",
    badge: "Base Sepolia proven",
    icon: Route,
  },
  "unified-balance": {
    title: "Gateway unified balance",
    label: "Next",
    copy: "Reserved for a funded Gateway deposit-and-spend proof. It stays gated until verified end to end.",
    badge: "Coming next",
    icon: LockKeyhole,
  },
};

function statusLabel(link: PaymentLink, isExpired: boolean) {
  if (link.status === "paid") return "Paid";
  if (link.status === "processing") return "Processing";
  if (link.status === "failed") return "Payment failed";
  if (link.status === "cancelled") return "Cancelled";
  if (link.status === "expired" || isExpired) return "Expired";
  return "Unpaid";
}

function statusDot(link: PaymentLink, isExpired: boolean) {
  if (link.status === "paid") return "bg-lime";
  if (link.status === "processing") return "bg-amber";
  if (link.status === "failed" || link.status === "cancelled" || link.status === "expired" || isExpired) {
    return "bg-danger";
  }
  return "bg-white/75";
}

function friendlyPaymentError(err: unknown, route: QuickRoute) {
  const message = err instanceof Error ? err.message : "Payment failed.";
  const lower = message.toLowerCase();
  if (lower.includes("user rejected") || lower.includes("rejected")) {
    return "Wallet request was rejected. Nothing moved; you can try again when ready.";
  }
  if (lower.includes("unsupported") || lower.includes("select a supported")) {
    return route === "app-kit-bridge"
      ? `Switch to ${provenBridgeSource.label} for the proven Circle CCTP route, then retry Bridge & pay.`
      : "Switch to Arc Testnet for direct payment, then retry.";
  }
  if (lower.includes("insufficient") || lower.includes("balance")) {
    return route === "app-kit-bridge"
      ? `Not enough USDC on the selected source chain. Fund ${provenBridgeSource.label} USDC or use direct Arc payment.`
      : "Not enough Arc USDC for this payment. Fund Arc Testnet USDC, then retry.";
  }
  if (lower.includes("bridge") || lower.includes("cctp")) {
    return "Circle CCTP bridge did not finish. If a burn/mint transaction completed, use the receipt links or retry after the network catches up.";
  }
  return message;
}

function makeDemoPayLink(slug: string): PaymentLink {
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + 7);
  expires.setHours(14, 22, 0, 0);
  return {
    id: `demo-${slug || "pay"}`,
    slug: slug || "9c3af80e",
    creatorWallet: "0x7a2f0000000000000000000000000000000091c4",
    recipientWallet: "0x7a2f0000000000000000000000000000000091c4",
    amountUSDC: "250.00",
    memo: "Branding work · invoice #0042",
    status: "unpaid",
    expiresAt: expires.toISOString(),
    contractLinkId: "0x1111111111111111111111111111111111111111111111111111111111111111",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

function formatExpiry(expiresAt: string | null) {
  if (!expiresAt) return "Never";
  const d = new Date(expiresAt);
  if (!Number.isFinite(d.getTime())) return "—";
  const date = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} · ${time}`;
}

export function PayLinkClient({ slug }: { slug: string }) {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const arcClient = usePublicClient({ chainId: ARC_CHAIN_ID });

  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activity, setActivity] = useState("");
  const { copied, copy } = useCopy();
  const [route, setRoute] = useState<QuickRoute>("arc-direct");
  const [bridgeSteps, setBridgeSteps] = useState<
    Partial<
      Record<
        BridgeStepName,
        { state: BridgeStepState; txHash?: string; explorerUrl?: string; error?: string }
      >
    >
  >({});
  const [settleState, setSettleState] = useState<"idle" | "active" | "success" | "error">("idle");
  const [receiptState, setReceiptState] = useState<"idle" | "active" | "success" | "error">("idle");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const saved = await getPaymentLinkBySlug(slug);
        const canShowDemoLink =
          ALLOW_DEMO_MODE || !process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://");
        setLink(saved ?? (canShowDemoLink ? makeDemoPayLink(slug) : null));
      } catch (err) {
        setLink(null);
        setError(err instanceof Error ? err.message : "Could not load this payment link.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const { data: usdcBalance } = useBalance({
    address,
    token: ARC_USDC_ADDRESS,
    chainId: ARC_CHAIN_ID,
    query: { enabled: Boolean(address) },
  });

  const amountNumber = link ? Number(link.amountUSDC) : 0;
  const hasDirectBalance = usdcBalance !== undefined;
  const balanceNumber = hasDirectBalance ? Number(usdcBalance.formatted) : 0;
  const displayExpiry = link?.id.startsWith("demo-") ? "Fri, May 30 · 14:22" : formatExpiry(link?.expiresAt ?? null);
  const isExpired = useMemo(() => {
    if (!link?.expiresAt) return false;
    return Date.now() > new Date(link.expiresAt).getTime();
  }, [link]);

  const isClosed = link?.status === "paid" || link?.status === "cancelled" || isExpired;

  async function settleOnArc(method: "arc-direct" | "app-kit-bridge" | "unified-balance" | "demo") {
    if (!link || !address) return;

    if (HAS_CONTRACT) {
      if (!arcClient) throw new Error("Arc RPC client is not available.");
      setSettleState("active");
      setActivity("Switching to Arc for settlement...");
      await switchChainAsync({ chainId: ARC_CHAIN_ID });
      setActivity("Approving Arc USDC...");
      const approveHash = await writeContractAsync({
        address: ARC_USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [ONELINK_CONTRACT_ADDRESS, amountToUnits(link.amountUSDC)],
      });
      const approveReceipt = await arcClient.waitForTransactionReceipt({ hash: approveHash });
      if (approveReceipt.status !== "success") {
        setSettleState("error");
        throw new Error("USDC approval failed on Arc.");
      }

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
        setSettleState("error");
        throw new Error("Arc settlement transaction failed.");
      }
      setSettleState("success");

      setReceiptState("active");
      const paid = await confirmPaidSettlement(link.id, {
        txHash: payHash,
        payerWallet: address,
        paymentMethod: method,
        sourceChain: method === "arc-direct" ? "Arc_Testnet" : "Bridged",
      });
      if (paid) setLink(paid);
      setReceiptState("success");
      setActivity("Settled on Arc.");
      return;
    }

    setActivity("Recording preview-only demo settlement...");
    setSettleState("active");
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
    setSettleState("success");
    setReceiptState("success");
  }

  async function pay() {
    setError("");
    setActivity("");
    setBridgeSteps({});
    setSettleState("idle");
    setReceiptState("idle");
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
      }

      if (route === "app-kit-bridge") {
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
        setActivity(`Bridging USDC from ${source.label} to Arc via Circle CCTP...`);
        await bridgeUsdcToArc({
          connector,
          source,
          amount: link.amountUSDC,
          recipient: address,
          onStep: (update) => {
            setBridgeSteps((current) => ({
              ...current,
              [update.step]: {
                state: update.state,
                txHash: update.txHash,
                explorerUrl: update.explorerUrl,
                error: update.error,
              },
            }));
          },
        });
        await settleOnArc("app-kit-bridge");
      }

      if (route === "unified-balance") {
        if (!connector) throw new Error("Wallet connector missing.");
        const processing = await updatePaymentStatus(link.id, "processing", {
          payerWallet: address,
          paymentMethod: "unified-balance",
          sourceChain: "Gateway_Unified_Testnet",
        });
        if (processing) setLink(processing);
        setActivity("Spending your unified Gateway USDC balance onto Arc...");
        await spendGatewayBalanceOnArc({ connector, amount: link.amountUSDC, recipient: address });
        await settleOnArc("unified-balance");
      }
    } catch (err) {
      if (link && HAS_CONTRACT) {
        const failed = await updatePaymentStatus(link.id, "failed", {
          payerWallet: address,
          paymentMethod: route,
          sourceChain:
            route === "unified-balance" ? "Gateway_Unified_Testnet" : getSourceChain(chainId)?.appKitName,
        });
        if (failed) setLink(failed);
      }
      setActivity("");
      setSettleState((current) => (current === "active" ? "error" : current));
      setReceiptState((current) => (current === "active" ? "error" : current));
      setError(friendlyPaymentError(err, route));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="pt-8 text-center text-base text-white/65">Loading payment link…</p>;
  }

  if (!link) {
    return (
      <div className="mx-auto grid h-full max-w-[342px] place-items-center pb-4 pt-2">
        <div className="text-center">
          <p className="mono-label text-[11px]">Payment link</p>
          <h1 className="mt-4 text-[30px] font-medium tracking-tight">
            {error ? "Could not load link" : "Link not found"}
          </h1>
          <p className="mt-3 text-[14px] text-white/45">
            {error || "Ask the sender for a fresh OneLink URL."}
          </p>
        </div>
      </div>
    );
  }

  const missingDirect =
    hasDirectBalance && Number.isFinite(balanceNumber) ? Math.max(0, amountNumber - balanceNumber) : 0;
  const paymentUrl =
    typeof window === "undefined" ? paymentPath(link.slug) : `${window.location.origin}${paymentPath(link.slug)}`;

  async function sharePaymentLink(payment: PaymentLink) {
    await shareOrCopy({
      title: `Pay ${payment.amountUSDC} USDC with OneLink`,
      text: payment.memo,
      url: paymentUrl,
    });
  }

  return (
    <div className="mx-auto flex h-full max-w-[342px] flex-col">
      <div className="-mt-[15px] space-y-[26px]">
        <div>
          <p className="mono-label text-[10px]">You&apos;re paying</p>
          <div className="mt-[7px] flex items-center gap-3">
            <span className="size-[25px] rounded-full bg-white/25" />
            <p className="text-[13px] font-medium">{shortAddress(link.recipientWallet)}</p>
          </div>
        </div>

        <div>
          <p className="mono-label text-[10px]">Amount</p>
          <div className="mt-[8px] flex items-end gap-[5px]">
            <p className="text-[66px] leading-none tracking-[-0.065em]">
              {Number(link.amountUSDC).toFixed(2)}
            </p>
            <span className="pb-[7px] text-[14px] font-medium text-white/58">USDC</span>
          </div>
        </div>

        <div>
          <p className="mono-label text-[10px]">Memo</p>
          <p className="mt-[9px] break-words text-[16px] font-medium leading-snug">{link.memo}</p>
        </div>

        <div className="surface rounded-[14px] px-[16px] py-[12px]">
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="text-[13px] font-medium text-white/55">Expires</p>
              <p className="mt-[2px] text-[14px]">{displayExpiry}</p>
            </div>
            <span className="inline-flex items-center gap-[6px] rounded-full border border-white/[0.08] bg-white/[0.04] px-[10px] py-[5px] text-[12px] font-semibold text-white/88">
              <span className={`size-[7px] rounded-full ${statusDot(link, isExpired)}`} />
              {statusLabel(link, isExpired)}
            </span>
          </div>
        </div>

        {!isClosed && (
          <div className="space-y-3">
            <p className="mono-label text-[10px]">Choose route</p>
            <div className="space-y-2">
              {displayRoutes.map((nextRoute) => {
                const detail = routeDetails[nextRoute];
                const Icon = detail.icon;
                const active = route === nextRoute;
                const enabled = availableRoutes.includes(nextRoute);
                return (
                  <button
                    key={nextRoute}
                    type="button"
                    disabled={!enabled}
                    onClick={() => enabled && setRoute(nextRoute)}
                    className={`w-full rounded-[16px] border p-4 text-left transition ${
                      active
                        ? "border-lime/45 bg-lime/[0.08]"
                        : "border-white/10 bg-white/[0.035] hover:border-white/20"
                    } ${enabled ? "" : "cursor-not-allowed opacity-65"}`}
                  >
                    <span className="flex items-start gap-3">
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-[12px] ${
                          active ? "bg-lime text-ink" : "bg-white/[0.05] text-white/48"
                        }`}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-3">
                          <span className="text-[15px] font-semibold text-white">{detail.title}</span>
                          <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold text-white/48">
                            {detail.label}
                          </span>
                        </span>
                        <span className="mt-2 block text-[12px] leading-5 text-white/48">{detail.copy}</span>
                        <span className="mt-3 inline-flex rounded-full bg-white/[0.05] px-2 py-1 text-[10px] font-semibold text-lime">
                          {detail.badge}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isConnected && route === "arc-direct" && hasDirectBalance && missingDirect > 0 && !isClosed && (
          <p className="text-[12px] text-amber">Need {missingDirect.toFixed(2)} more Arc USDC for direct pay.</p>
        )}

        {isConnected && route === "app-kit-bridge" && !isClosed && (
          <p className="text-[12px] leading-5 text-white/48">
            Proven route: {provenBridgeSource.label} to Arc through Circle CCTP. Other testnet sources stay beta
            until they receive the same proof standard.
          </p>
        )}

        {ENABLE_GATEWAY_ROUTE && isConnected && route === "unified-balance" && !isClosed && (
          <p className="text-[12px] text-white/48">Uses confirmed USDC previously deposited into Circle Gateway.</p>
        )}

        {activity && <p className="text-[12px] text-lime">{activity}</p>}
        {error && <p className="text-[12px] text-[#ffbcbc]">{error}</p>}

        {!isClosed && (
          <ArcPreFlight
            amountUSDC={link.amountUSDC}
            balanceUSDC={hasDirectBalance ? usdcBalance?.formatted : undefined}
            isConnected={isConnected}
            needsApproval
          />
        )}

        {route === "app-kit-bridge" && (busy || Object.keys(bridgeSteps).length > 0 || link.status === "paid") && (
          <BridgeStepTimeline
            steps={bridgeSteps}
            sourceLabel={provenBridgeSource.label}
            settleState={settleState}
            receiptState={receiptState}
          />
        )}
      </div>

      <div className="mt-auto pt-6">
        <div className="mx-auto max-w-[342px]">
          {link.status === "paid" ? (
            <Link
              href={receiptPath(link.id)}
              className="inline-flex h-[58px] w-full items-center justify-center rounded-[14px] bg-lime text-[16px] font-medium tracking-tight text-ink"
            >
              View verified receipt
            </Link>
          ) : isConnected ? (
            <button
              type="button"
              onClick={pay}
              disabled={
                busy ||
                isClosed ||
                (route === "arc-direct" && hasDirectBalance && missingDirect > 0) ||
                !Number.isFinite(amountNumber)
              }
              className="inline-flex h-[58px] w-full items-center justify-center rounded-[14px] bg-lime text-[16px] font-medium tracking-tight text-ink disabled:opacity-45"
            >
              {busy
                ? "Processing..."
                : link.status === "cancelled"
                    ? "Link cancelled"
                    : isExpired
                      ? "Link expired"
                      : route === "arc-direct"
                        ? "Pay on Arc"
                        : route === "app-kit-bridge"
                          ? "Bridge & pay"
                          : "Pay with unified balance"}
            </button>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  type="button"
                  onClick={openConnectModal}
                  className="inline-flex h-[58px] w-full items-center justify-center rounded-[14px] bg-lime text-[16px] font-medium tracking-tight text-ink"
                >
                  Connect wallet
                </button>
              )}
            </ConnectButton.Custom>
          )}
          <p className="mt-[11px] text-center text-[12px] text-white/35">
            {link.status === "paid"
              ? "Settlement verified on Arc Testnet"
              : link.status === "cancelled"
                ? "This request is no longer accepting payment"
                : isExpired
                  ? "This request is no longer accepting payment"
                  : !isConnected
              ? "You'll choose a chain after connecting"
              : `Connected: ${shortAddress(address)}${HAS_CONTRACT ? "" : " · demo settlement mode"}`}
          </p>
          <Link
            href="/security"
            target="_blank"
            className="mt-3 block text-center text-[12px] text-white/42 transition hover:text-white/70"
          >
            Verification and testnet scope
          </Link>
          {link.status === "unpaid" && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => copy(paymentUrl)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-white/10 text-[13px] font-medium text-white/68"
              >
                {copied ? <Check className="size-4 text-lime" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={() => sharePaymentLink(link)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-white/10 text-[13px] font-medium text-white/68"
              >
                <Share2 className="size-4" />
                Share
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
