"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { isAddress } from "viem";
import { BadgeCheck, Copy, ExternalLink, LockKeyhole, ReceiptText, Route, ShieldCheck } from "lucide-react";
import { makeContractLinkId, makeSlug, paymentPath, shortAddress, type PaymentLink } from "@/lib/payments";
import { getFreelancerProfile, type FreelancerProfile } from "@/lib/profiles";
import { shareOrCopy } from "@/lib/share";
import { savePaymentLink } from "@/lib/storage";

const AMOUNT_RE = /^\d+(\.\d{1,6})?$/;
const amountPresets = ["25", "100", "250"] as const;
const memoPresets = ["Invoice", "Retainer", "Milestone"] as const;

function initials(value: string) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "OL";
}

function profileTitle(profile: FreelancerProfile) {
  const name = profile.displayName?.trim();
  if (!name || name.toLowerCase() === profile.handle || name.length > 24) return "OneLink Creator";
  return name;
}

export function ProfilePayClient({ handle }: { handle: string }) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getFreelancerProfile(handle)
      .then(setProfile)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load profile."))
      .finally(() => setLoading(false));
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
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function shareProfileLink() {
    if (!profile) return;
    await shareOrCopy({
      title: `Pay ${profileTitle(profile)} with OneLink`,
      text: `Send USDC to @${profile.handle} through a supported OneLink route.`,
      url: window.location.href,
    });
  }

  if (loading) return <p className="pt-16 text-center text-white/55">Loading profile...</p>;
  if (!profile) {
    return (
      <main className="mx-auto max-w-[720px] py-10 sm:py-20">
        <section className="surface rounded-[30px] px-7 py-12 text-center sm:px-12 sm:py-16">
          <p className="mono-label text-[13px]">Freelancer profile</p>
          <h1 className="mt-5 text-[48px] font-medium leading-none tracking-[-0.04em] sm:text-[60px]">Link not found</h1>
          <p className="mx-auto mt-5 max-w-[500px] text-[18px] leading-7 text-white/52 sm:text-[21px]">
            {error || "This permanent payment link is not active. Check the handle or create a new request."}
          </p>
          <Link
            href="/create"
            className="mt-9 inline-flex h-[62px] items-center justify-center rounded-[19px] bg-lime px-8 text-[20px] font-medium text-ink"
          >
            Create a payment link
          </Link>
        </section>
      </main>
    );
  }

  const title = profileTitle(profile);

  return (
    <main className="mx-auto grid max-w-[1180px] min-w-0 gap-8 overflow-hidden py-6 sm:py-14 xl:grid-cols-[minmax(0,0.92fr)_520px] xl:items-start">
      <section className="min-w-0">
        <div className="surface relative min-w-0 overflow-hidden rounded-[32px] p-6 sm:rounded-[40px] sm:p-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,242,103,0.18),transparent_52%)]" />
          <div className="relative">
            <div className="flex min-w-0 flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-5">
                <div className="grid size-20 shrink-0 place-items-center rounded-[26px] border border-lime/25 bg-lime text-[28px] font-semibold tracking-[-0.04em] text-ink shadow-[0_18px_80px_rgba(201,242,103,0.14)] sm:size-24">
                  {initials(title)}
                </div>
                <div className="min-w-0">
                  <p className="mono-label text-[12px]">OneLink profile</p>
                  <h1 className="mt-3 max-w-[430px] text-balance text-[38px] font-medium leading-[1.12] tracking-[-0.05em] sm:text-[48px] 2xl:text-[52px]">
                    {title}
                  </h1>
                  <p className="mt-3 max-w-full truncate text-[18px] font-medium text-white/56">@{profile.handle}</p>
                </div>
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-2 sm:w-[260px]">
                <button
                  type="button"
                  onClick={copyProfileLink}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[14px] font-medium text-white/72 transition hover:border-lime/35 hover:text-lime"
                >
                  <Copy className="size-4" />
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={shareProfileLink}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-lime px-4 text-[14px] font-semibold text-ink transition hover:bg-[#d9fa7b]"
                >
                  Share
                </button>
              </div>
            </div>

            <p className="mt-8 max-w-[680px] text-[18px] leading-8 text-white/62 sm:text-[24px] sm:leading-9">
              A client-ready USDC payment profile for invoices, retainers, and milestones. Payments stay
              pending until OneLink verifies settlement and creates a receipt.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {["Invoice-ready", "Arc verified", "USDC routes", "Receipt proof"].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-lime/20 bg-lime/[0.07] px-3 py-1.5 text-[12px] font-semibold text-lime"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Arc receipt", "Verified after settlement", ReceiptText],
                ["Wallet-owned", shortAddress(profile.wallet), BadgeCheck],
                ["Gateway", "Gated until funded proof", LockKeyhole],
              ].map(([label, value, Icon]) => (
                <div key={label as string} className="rounded-[20px] border border-white/[0.08] bg-black/15 p-4">
                  <Icon className="size-5 text-lime" />
                  <p className="mt-5 text-[17px] font-medium">{label as string}</p>
                  <p className="mt-1 text-[13px] leading-5 text-white/45">{value as string}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
          <section className="surface rounded-[26px] p-6">
            <Route className="size-5 text-lime" />
            <h2 className="mt-8 text-[28px] font-medium tracking-tight">Supported routes</h2>
            <p className="mt-3 text-[16px] leading-7 text-white/55">
              Direct Arc payment is available after checkout. Base Sepolia to Arc is the live-proven
              bridge path through Circle CCTP.
            </p>
            <div className="mt-5 grid gap-2 text-[13px] font-medium text-white/58">
              <span className="rounded-full bg-white/[0.035] px-3 py-2">Pay on Arc · fastest route</span>
              <span className="rounded-full bg-white/[0.035] px-3 py-2">Bridge from Base Sepolia · proven route</span>
            </div>
          </section>
          <section className="surface rounded-[26px] p-6">
            <ShieldCheck className="size-5 text-lime" />
            <h2 className="mt-8 text-[28px] font-medium tracking-tight">Gateway status</h2>
            <p className="mt-3 text-[16px] leading-7 text-white/55">
              Circle Gateway unified-balance checkout is intentionally hidden until a funded
              deposit, burn, and mint flow is proven end to end.
            </p>
            <div className="mt-5 rounded-[18px] border border-white/10 bg-black/20 p-4">
              <p className="mono-label text-[11px]">Next milestone</p>
              <p className="mt-2 text-[14px] leading-6 text-white/58">
                Prove funded Gateway deposit and spend before exposing it as a live payment option.
              </p>
            </div>
          </section>
        </div>
      </section>

      <section className="surface min-w-0 space-y-6 rounded-[30px] p-6 sm:p-8 xl:sticky xl:top-8">
        <div>
          <p className="mono-label text-[12px]">Pay @{profile.handle}</p>
          <h2 className="mt-4 text-[38px] font-medium leading-none tracking-[-0.045em] sm:text-[48px]">
            Send USDC
          </h2>
        </div>

        <label className="block space-y-3">
          <span className="mono-label text-[11px]">Amount</span>
          <div className="flex items-center rounded-[22px] border border-white/10 bg-black/15 px-5">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="h-20 min-w-0 flex-1 bg-transparent text-[46px] tracking-[-0.05em] outline-none placeholder:text-white/20"
            />
            <span className="font-medium text-white/50">USDC</span>
          </div>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {amountPresets.map((preset) => (
            <button
              type="button"
              key={preset}
              onClick={() => setAmount(preset)}
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.035] text-[13px] font-medium text-white/70 transition hover:border-lime/35 hover:text-lime sm:text-[15px]"
            >
              {preset} USDC
            </button>
          ))}
        </div>

        <label className="block space-y-3">
          <span className="mono-label text-[11px]">Memo</span>
          <input
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="Payment description"
            className="h-16 w-full rounded-[20px] border border-white/10 bg-black/15 px-5 text-[17px] outline-none placeholder:text-white/28"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {memoPresets.map((preset) => (
            <button
              type="button"
              key={preset}
              onClick={() => setMemo(preset)}
              className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-[13px] font-medium text-white/58 transition hover:border-lime/35 hover:text-lime"
            >
              {preset}
            </button>
          ))}
        </div>

        {error && <p className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-[#ffbcbc]">{error}</p>}

        {isConnected ? (
          <button
            type="button"
            disabled={busy}
            onClick={continueToPayment}
            className="h-16 w-full rounded-[20px] bg-lime text-[20px] font-medium text-ink disabled:opacity-50"
          >
            {busy ? "Preparing payment..." : "Continue to pay"}
          </button>
        ) : (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                type="button"
                onClick={openConnectModal}
                className="h-16 w-full rounded-[20px] bg-lime text-[20px] font-medium text-ink"
              >
                Connect wallet to pay
              </button>
            )}
          </ConnectButton.Custom>
        )}

        <Link
          href="/security"
          className="inline-flex items-center gap-2 text-[14px] font-medium text-white/52 transition hover:text-white"
        >
          Review verification scope
          <ExternalLink className="size-4" />
        </Link>
      </section>
    </main>
  );
}
