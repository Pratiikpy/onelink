"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isAddress } from "viem";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, ArrowRight, Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

import { AppNav } from "@/components/onelink/nav";
import { BottomBar } from "@/components/onelink/bottom-bar";
import { Button } from "@/components/ui/button";
import { ARC_CHAIN_ID } from "@/lib/arc";
import { friendlyError } from "@/lib/errors";
import {
  HAS_CONTRACT,
  ONELINK_CONTRACT_ADDRESS,
  PLATFORM_FEE_BPS,
  oneLinkCollectAbi,
} from "@/lib/contracts";
import {
  amountToUnits,
  makeContractLinkId,
  makeSlug,
  paymentPath,
  type PaymentLink,
} from "@/lib/payments";
import { savePaymentLink, saveVerifiedInvoiceLink } from "@/lib/storage";
import { formatUSDC, truncateAddr } from "@/lib/format";
import { shareOrCopy } from "@/lib/share";
import { cn } from "@/lib/utils";

type Expiry = "24h" | "7d" | "30d" | "never";

const expiryHours: Record<Expiry, number | null> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
  never: null,
};

const AMOUNT_RE = /^\d+(\.\d{1,6})?$/;

export function CreateLinkForm() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const arcClient = usePublicClient({ chainId: ARC_CHAIN_ID });

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [amount, setAmount] = useState("250");
  const [memo, setMemo] = useState("");
  const [recipient, setRecipient] = useState<string>("");
  const [expiry, setExpiry] = useState<Expiry>("7d");
  const [signing, setSigning] = useState(false);
  const [createdLink, setCreatedLink] = useState<PaymentLink | null>(null);
  const [error, setError] = useState("");

  // Initialize recipient with connected address
  if (address && recipient === "") setRecipient(address);

  const validInputs =
    AMOUNT_RE.test(amount) &&
    Number(amount) > 0 &&
    memo.trim().length > 0 &&
    isAddress(recipient || "");

  const expiresAt = (() => {
    const hours = expiryHours[expiry];
    if (hours === null) return null;
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  })();

  const slug = makeSlug(memo || "collect", amount);
  const linkId = makeContractLinkId(slug);
  const feeUsdc = (Number(amount) * PLATFORM_FEE_BPS) / 10000;

  async function sign() {
    if (!validInputs || !address) return;
    setError("");
    setSigning(true);
    try {
      const now = new Date().toISOString();
      const link: PaymentLink = {
        id: crypto.randomUUID(),
        slug,
        creatorWallet: address,
        recipientWallet: recipient as `0x${string}`,
        amountUSDC: amount,
        memo: memo.trim(),
        status: "unpaid",
        expiresAt,
        contractLinkId: linkId,
        createdAt: now,
        updatedAt: now,
      };

      if (!HAS_CONTRACT) {
        // Demo mode: save to localStorage immediately
        await savePaymentLink(link);
        setCreatedLink(link);
        setStep(4);
        return;
      }

      // Real flow: switch to Arc, sign createLink, server-verify, persist
      if (!arcClient) throw new Error("Arc RPC client unavailable.");
      await switchChainAsync({ chainId: ARC_CHAIN_ID });
      const expiresAtUint = expiresAt
        ? BigInt(Math.floor(new Date(expiresAt).getTime() / 1000))
        : BigInt(0);
      const txHash = await writeContractAsync({
        address: ONELINK_CONTRACT_ADDRESS,
        abi: oneLinkCollectAbi,
        functionName: "createLink",
        args: [linkId, recipient as `0x${string}`, amountToUnits(amount), expiresAtUint],
      });
      const receipt = await arcClient.waitForTransactionReceipt({ hash: txHash });
      if (receipt.status !== "success") throw new Error("createLink reverted on Arc.");
      const verified = await saveVerifiedInvoiceLink(link, txHash);
      setCreatedLink(verified ?? link);
      setStep(4);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSigning(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background page-in">
        <AppNav />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Create a payment link
          </p>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em]">
            Connect a wallet to begin
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            OneLink registers links on Arc Testnet. The connected wallet pays gas in USDC.
          </p>
          <div className="mt-7 flex justify-center">
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button onClick={openConnectModal} size="lg">
                  Connect wallet
                </Button>
              )}
            </ConnectButton.Custom>
          </div>
        </main>
      </div>
    );
  }

  const linkUrl =
    typeof window !== "undefined" && createdLink
      ? `${window.location.origin}${paymentPath(createdLink.slug)}`
      : "";

  return (
    <div className="min-h-screen bg-background page-in">
      <AppNav />
      <main className="mx-auto max-w-2xl px-6 py-12 pb-28 md:pb-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mt-8 flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={cn(
                "h-[2px] flex-1 rounded-full transition-colors duration-300",
                step >= s ? "bg-foreground" : "bg-hairline",
              )}
            />
          ))}
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Step {Math.min(step, 3)} of 3
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em]">
          {step === 1 && "Payment details"}
          {step === 2 && "Review"}
          {step === 3 && "Sign to publish"}
          {step === 4 && "Link is live"}
        </h1>

        <div className="mt-8 rounded-2xl border border-hairline bg-surface p-7 card-elev">
          {step === 1 && (
            <div className="space-y-5">
              <Field label="Amount">
                <div className="flex items-baseline gap-2 border-b border-hairline pb-3 focus-within:border-foreground/40">
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                    inputMode="decimal"
                    placeholder="0"
                    className="w-full bg-transparent font-display text-5xl font-semibold tracking-tight tabular-nums outline-none"
                  />
                  <span className="font-mono text-sm text-muted-foreground">USDC</span>
                </div>
              </Field>
              <Field label="Memo">
                <input
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="What's this for?"
                  className="w-full rounded-md border border-hairline bg-background px-3 py-2.5 text-base md:text-sm outline-none focus:border-foreground/40"
                />
              </Field>
              <Field label="Recipient" hint="Defaults to your connected wallet">
                <input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full rounded-md border border-hairline bg-background px-3 py-2.5 font-mono text-[16px] md:text-xs outline-none focus:border-foreground/40"
                />
              </Field>
              <Field label="Expiry">
                <div className="grid grid-cols-4 gap-1.5">
                  {(["24h", "7d", "30d", "never"] as Expiry[]).map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setExpiry(e)}
                      className={cn(
                        "rounded-md border px-3 py-2 text-sm transition-colors",
                        expiry === e
                          ? "border-foreground bg-foreground text-background"
                          : "border-hairline hover:bg-muted",
                      )}
                    >
                      {e === "never" ? "Never" : e}
                    </button>
                  ))}
                </div>
              </Field>
              <Button
                onClick={() => setStep(2)}
                disabled={!validInputs}
                size="lg"
                className="w-full"
              >
                Review <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <Row k="Amount" v={<span className="font-mono tabular-nums">{formatUSDC(amount)} USDC</span>} />
              <Row k="Memo" v={memo} />
              <Row k="Recipient" v={<span className="font-mono text-xs">{truncateAddr(recipient)}</span>} />
              <Row k="Expiry" v={expiry === "never" ? "No expiry" : expiry} />
              <Row k="Network" v="Arc Testnet · chain 5042002" />
              <Row
                k="Fee"
                v={
                  <span>
                    <span className="font-mono">{formatUSDC(feeUsdc)}</span> USDC{" "}
                    <span className="text-muted-foreground">
                      ({PLATFORM_FEE_BPS / 100}% protocol cap)
                    </span>
                  </span>
                }
              />
              <Row
                k="Contract link ID"
                v={
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {linkId.slice(0, 14)}…{linkId.slice(-10)}
                  </span>
                }
              />
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button size="lg" className="flex-[2]" onClick={() => setStep(3)}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-hairline">
                <span className="h-2.5 w-2.5 rounded-full bg-foreground animate-pulse-dot" />
              </div>
              <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">
                Sign in your wallet
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {HAS_CONTRACT
                  ? "OneLink will register the link on Arc. You sign one transaction."
                  : "Demo mode — link is saved locally without a real chain transaction."}
              </p>
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  Advanced details
                </summary>
                <div className="mt-3 space-y-2 rounded-lg border border-hairline bg-muted/40 p-3 font-mono text-[11px]">
                  <p>
                    <span className="text-muted-foreground">contract:</span> OneLinkCollect
                  </p>
                  <p>
                    <span className="text-muted-foreground">method:</span> createLink(linkId, recipient, amount, expiresAt)
                  </p>
                  <p>
                    <span className="text-muted-foreground">chain:</span> Arc Testnet ({ARC_CHAIN_ID})
                  </p>
                </div>
              </details>
              {error && (
                <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/[0.05] p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button
                onClick={sign}
                size="lg"
                className="mt-4 hidden w-full md:inline-flex"
                loading={signing}
              >
                {HAS_CONTRACT ? "Open wallet to sign" : "Save demo link"}
              </Button>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setStep(2)}>
                Cancel
              </Button>
            </div>
          )}

          {step === 4 && createdLink && (
            <div>
              <div className="flex items-center gap-2 text-success">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-success text-success-foreground">
                  <Check className="h-4 w-4" />
                </span>
                <p className="text-sm font-medium">
                  {HAS_CONTRACT ? "Link registered on Arc" : "Demo link saved"}
                </p>
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">
                Share your link
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto]">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-md border border-hairline bg-background p-2">
                    <span className="flex-1 truncate px-2 font-mono text-xs">{linkUrl}</span>
                    <Button
                      size="sm"
                      onClick={async () => {
                        await navigator.clipboard.writeText(linkUrl);
                        toast.success("Link copied");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() =>
                      shareOrCopy({ title: createdLink.memo, url: linkUrl })
                    }
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                  <Button asChild size="lg" className="w-full">
                    <Link href={paymentPath(createdLink.slug)}>Preview pay page</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => router.push("/dashboard")}
                  >
                    Back to dashboard
                  </Button>
                </div>
                <div className="rounded-xl border border-hairline bg-background p-3">
                  <QRCodeSVG value={linkUrl} size={140} bgColor="transparent" fgColor="currentColor" />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {step === 3 && (
        <BottomBar>
          <Button
            onClick={sign}
            size="lg"
            className="w-full"
            loading={signing}
          >
            {HAS_CONTRACT ? "Open wallet to sign" : "Save demo link"}
          </Button>
        </BottomBar>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline pb-3 last:border-0">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-right text-sm">{v}</span>
    </div>
  );
}
