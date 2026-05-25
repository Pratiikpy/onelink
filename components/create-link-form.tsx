"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useChainId, useSwitchChain, useWriteContract } from "wagmi";
import { isAddress, type Address } from "viem";
import { ArrowRight, BadgeDollarSign, CalendarClock, Link2, Loader2, Sparkles } from "lucide-react";
import { Card, Field, Input, Textarea, Button, Pill } from "@/components/ui";
import { ARC_CHAIN_ID } from "@/lib/arc";
import { HAS_CONTRACT, ONELINK_CONTRACT_ADDRESS, oneLinkCollectAbi } from "@/lib/contracts";
import { amountToUnits, makeContractLinkId, makeSlug, type PaymentLink } from "@/lib/payments";
import { savePaymentLink } from "@/lib/storage";

export function CreateLinkForm() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [amount, setAmount] = useState("10");
  const [recipient, setRecipient] = useState("");
  const [memo, setMemo] = useState("Design payment");
  const [expiresAt, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const normalizedRecipient = useMemo(() => {
    if (recipient.trim()) return recipient.trim();
    return address ?? "";
  }, [address, recipient]);

  async function createLink() {
    setError("");

    if (!isConnected || !address) {
      setError("Connect a wallet to create a testnet payment link.");
      return;
    }

    if (!isAddress(normalizedRecipient)) {
      setError("Enter a valid recipient wallet address.");
      return;
    }

    if (!Number(amount) || Number(amount) <= 0) {
      setError("Amount must be greater than 0 USDC.");
      return;
    }

    setBusy(true);
    try {
      if (HAS_CONTRACT && chainId !== ARC_CHAIN_ID) {
        await switchChainAsync({ chainId: ARC_CHAIN_ID });
      }

      const slug = makeSlug(memo, amount);
      const contractLinkId = makeContractLinkId(slug);
      const now = new Date().toISOString();
      const expirySeconds = expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : 0;

      if (HAS_CONTRACT) {
        await writeContractAsync({
          address: ONELINK_CONTRACT_ADDRESS,
          abi: oneLinkCollectAbi,
          functionName: "createLink",
          args: [
            contractLinkId,
            normalizedRecipient as Address,
            amountToUnits(amount),
            BigInt(expirySeconds),
          ],
        });
      }

      const link: PaymentLink = {
        id: crypto.randomUUID(),
        slug,
        creatorWallet: address,
        recipientWallet: normalizedRecipient as Address,
        amountUSDC: amount,
        memo,
        status: "unpaid",
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        contractLinkId,
        createdAt: now,
        updatedAt: now,
      };

      await savePaymentLink(link);
      router.push(`/pay/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-6">
        <div className="space-y-4">
          <Pill>
            <Sparkles className="size-3.5" />
            Arc Testnet
          </Pill>
          <div>
            <h1 className="max-w-2xl text-balance text-5xl font-black leading-[0.95] tracking-normal text-white sm:text-6xl">
              One link. Any USDC. Instantly on Arc.
            </h1>
            <p className="mt-4 max-w-xl text-base font-medium leading-7 text-white/55">
              Create a clean USDC payment link. Payers can settle directly on Arc Testnet, then
              bridge into Arc through Circle App Kit when they start from another chain.
            </p>
          </div>
        </div>

        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white/45">Create request</p>
              <h2 className="text-2xl font-black text-white">Collect USDC</h2>
            </div>
            <div className="grid size-12 place-items-center rounded-2xl border border-violet/30 bg-violet/10">
              <Link2 className="size-5 text-violet" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
            <Field label="Amount">
              <div className="relative">
                <BadgeDollarSign className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-violet" />
                <Input
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="pl-11"
                />
              </div>
            </Field>
            <Field label="Recipient wallet" hint="Defaults to your connected wallet.">
              <Input
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                placeholder={address || "0x..."}
              />
            </Field>
          </div>

          <Field label="Memo">
            <Textarea value={memo} onChange={(event) => setMemo(event.target.value)} />
          </Field>

          <Field label="Expiration" hint="Optional. Leave blank for no expiry.">
            <div className="relative">
              <CalendarClock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-violet" />
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                className="pl-11"
              />
            </div>
          </Field>

          {error && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm font-semibold text-red-200">
              {error}
            </div>
          )}

          <Button type="button" onClick={createLink} disabled={busy} className="w-full">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            Create payment link
          </Button>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="space-y-4">
          <p className="text-sm font-bold text-white/48">Launch stack</p>
          {[
            "Arc USDC gas",
            "Sub-second settlement receipts",
            "App Kit Bridge path",
            "Unified Balance ready",
            "Circle Wallets staged",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3">
              <span className="size-2 rounded-full bg-mint" />
              <span className="text-sm font-bold text-white/80">{item}</span>
            </div>
          ))}
        </Card>

        <Card className="bg-violet/12">
          <p className="text-sm font-semibold text-white/55">Testnet note</p>
          <p className="mt-2 text-2xl font-black leading-tight text-white">Use faucet USDC first.</p>
          <p className="mt-2 text-sm leading-6 text-white/50">
            Arc uses USDC as gas. Your wallet may display it like ETH, but the underlying native gas
            token is USDC.
          </p>
        </Card>
      </aside>
    </div>
  );
}
