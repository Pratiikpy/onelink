"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { isAddress } from "viem";
import { makeContractLinkId, makeSlug, shortAddress, type PaymentLink } from "@/lib/payments";
import { getFreelancerProfile, type FreelancerProfile } from "@/lib/profiles";
import { savePaymentLink } from "@/lib/storage";

const AMOUNT_RE = /^\d+(\.\d{1,6})?$/;

export function ProfilePayClient({ handle }: { handle: string }) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
      router.push(`/pay/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment.");
    } finally {
      setBusy(false);
    }
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

  return (
    <main className="mx-auto max-w-xl py-10 sm:py-20">
      <p className="mono-label text-[13px]">Pay @{profile.handle}</p>
      <h1 className="mt-5 text-[52px] font-medium leading-none tracking-[-0.045em]">
        Send USDC
        <br />
        on a supported route
      </h1>
      <div className="surface mt-10 space-y-6 rounded-[26px] p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
          <span className="size-11 rounded-full bg-white/20" />
          <div>
            <p className="font-medium">@{profile.handle}</p>
            <p className="text-sm text-white/48">{shortAddress(profile.wallet)}</p>
          </div>
        </div>
        <label className="block space-y-3">
          <span className="mono-label text-[11px]">Amount</span>
          <div className="flex items-center rounded-2xl border border-white/10 bg-black/15 px-5">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="h-20 min-w-0 flex-1 bg-transparent text-4xl outline-none"
            />
            <span className="text-white/50">USDC</span>
          </div>
        </label>
        <label className="block space-y-3">
          <span className="mono-label text-[11px]">Memo</span>
          <input
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="Payment description"
            className="h-16 w-full rounded-2xl border border-white/10 bg-black/15 px-5 outline-none"
          />
        </label>
        {error && <p className="text-sm text-[#ffbcbc]">{error}</p>}
        {isConnected ? (
          <button
            type="button"
            disabled={busy}
            onClick={continueToPayment}
            className="h-16 w-full rounded-2xl bg-lime font-medium text-ink disabled:opacity-50"
          >
            {busy ? "Preparing payment..." : "Continue to pay"}
          </button>
        ) : (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button type="button" onClick={openConnectModal} className="h-16 w-full rounded-2xl bg-lime font-medium text-ink">
                Connect wallet to pay
              </button>
            )}
          </ConnectButton.Custom>
        )}
      </div>
    </main>
  );
}
