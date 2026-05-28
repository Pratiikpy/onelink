"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isAddress } from "viem";
import { ArrowRight, Copy, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/onelink/logo";
import { ARC_CHAIN_ID } from "@/lib/arc";
import {
  makeContractLinkId,
  makeSlug,
  paymentPath,
  type PaymentLink,
} from "@/lib/payments";
import {
  getFreelancerProfile,
  type FreelancerProfile,
} from "@/lib/profiles";
import { shareOrCopy } from "@/lib/share";
import { savePaymentLink } from "@/lib/storage";
import { truncateAddr } from "@/lib/format";

const AMOUNT_RE = /^\d+(\.\d{1,6})?$/;
const amountPresets = ["25", "100", "250"] as const;
const memoPresets = ["Invoice", "Retainer", "Milestone"] as const;

function profileTitle(profile: FreelancerProfile) {
  const name = profile.displayName?.trim();
  if (!name || name.toLowerCase() === profile.handle || name.length > 24)
    return "OneLink Creator";
  return name;
}

function initials(value: string) {
  const parts = value.split(/[\s-]+/).filter(Boolean).slice(0, 2);
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return letters || "OL";
}

export function ProfilePayClient({ handle }: { handle: string }) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getFreelancerProfile(handle)
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load profile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  async function continueToPayment() {
    setError("");
    if (!profile || !isConnected || !address) return;
    if (!AMOUNT_RE.test(amount) || Number(amount) <= 0) {
      setError("Enter a valid USDC amount with up to 6 decimals.");
      return;
    }
    if (!isAddress(profile.wallet)) {
      setError("This payment profile has an invalid recipient wallet.");
      return;
    }

    setBusy(true);
    try {
      const slug = makeSlug(`${profile.handle}-${memo}`, amount);
      const now = new Date().toISOString();
      const payment: PaymentLink = {
        id: crypto.randomUUID(),
        slug,
        creatorWallet: profile.wallet,
        recipientWallet: profile.wallet,
        amountUSDC: amount,
        memo: memo.trim() || `Payment to ${profile.handle}`,
        status: "unpaid",
        expiresAt: null,
        contractLinkId: makeContractLinkId(`${profile.handle}:${slug}`),
        settlementMode: "profile",
        createdAt: now,
        updatedAt: now,
      };
      await savePaymentLink(payment);
      router.push(paymentPath(slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment.");
    } finally {
      setBusy(false);
    }
  }

  async function copyProfileLink() {
    if (typeof window === "undefined") return;
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function shareProfileLink() {
    if (!profile) return;
    await shareOrCopy({
      title: `Pay ${profileTitle(profile)} with OneLink`,
      text: `Send USDC to @${profile.handle}.`,
      url: typeof window !== "undefined" ? window.location.href : "",
    });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center text-sm text-muted-foreground">
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background page-in">
        <header className="border-b border-hairline">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
            <Logo />
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Create your own
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Freelancer profile
          </p>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em]">
            Link not found
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {error || "This permanent payment link is not active. Check the handle or create a new request."}
          </p>
          <Link
            href="/create"
            className="mt-7 inline-flex h-10 items-center rounded-md bg-foreground px-5 text-sm font-medium text-background"
          >
            Create a payment link
          </Link>
        </main>
      </div>
    );
  }

  const title = profileTitle(profile);

  return (
    <div className="min-h-screen bg-background page-in">
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Logo />
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Create your own
          </Link>
        </div>
      </header>

      <div className="border-b border-hairline bg-muted/40">
        <div className="dot-bg h-28" />
      </div>

      <main className="mx-auto grid max-w-5xl gap-10 px-6 py-14 md:grid-cols-[1fr_360px]">
        <section>
          <div className="-mt-20 flex items-start gap-5">
            <span
              className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl text-background font-display text-3xl font-semibold ring-4 ring-background"
              style={{
                background:
                  "conic-gradient(from 200deg, oklch(0.16 0.004 260), oklch(0.42 0.06 158), oklch(0.16 0.004 260))",
              }}
            >
              {initials(title)}
            </span>
            <div className="pt-3">
              <h1 className="font-display text-3xl font-semibold tracking-[-0.03em]">
                {title}
              </h1>
              <p className="font-mono text-sm text-muted-foreground">@{profile.handle}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Accepts USDC on Arc · {truncateAddr(profile.wallet)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyProfileLink}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-background px-4 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied" : "Copy profile link"}
            </button>
            <button
              type="button"
              onClick={shareProfileLink}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-xs font-medium text-background"
            >
              Share
            </button>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {[
              ["Network", `Arc Testnet · ${ARC_CHAIN_ID}`],
              ["Wallet", truncateAddr(profile.wallet)],
              ["Routes", "Arc-direct · CCTP bridge"],
            ].map(([k, v]) => (
              <div
                key={k as string}
                className="rounded-xl border border-hairline bg-surface p-4"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {k}
                </p>
                <p className="mt-2 font-mono text-xs text-foreground">{v}</p>
              </div>
            ))}
          </div>
        </section>

        <aside>
          <div className="sticky top-20 rounded-2xl border border-hairline bg-surface p-7 card-lift">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Send USDC
            </p>
            <div className="mt-4 flex items-baseline gap-2 border-b border-hairline pb-3 transition-colors focus-within:border-foreground/40">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0"
                inputMode="decimal"
                autoFocus
                className="w-full bg-transparent font-display text-5xl font-semibold tracking-[-0.04em] tabular-nums outline-none"
              />
              <span className="font-mono text-sm text-muted-foreground">USDC</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {amountPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className="h-9 rounded-md border border-hairline bg-background text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {preset}
                </button>
              ))}
            </div>

            <input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="What's this for? (optional)"
              className="mt-5 w-full rounded-md border border-hairline bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-foreground/40"
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {memoPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMemo(preset)}
                  className="rounded-full border border-hairline bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {preset}
                </button>
              ))}
            </div>

            {error && <p className="mt-4 text-xs text-destructive">{error}</p>}

            {isConnected ? (
              <button
                type="button"
                disabled={busy || !amount}
                onClick={continueToPayment}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-md bg-foreground text-sm font-medium text-background disabled:opacity-40"
              >
                {busy ? "Preparing…" : "Continue to pay"}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-foreground text-sm font-medium text-background"
                  >
                    Connect wallet to pay
                  </button>
                )}
              </ConnectButton.Custom>
            )}

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Settled on Arc · Verified on-chain · Non-custodial
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
