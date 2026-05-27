"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, usePublicClient, useSignMessage, useSwitchChain, useWriteContract } from "wagmi";
import { getAddress, isAddress, type Address } from "viem";
import { RingIcon } from "@/components/logo";
import { ARC_CHAIN_ID } from "@/lib/arc";
import { HAS_CONTRACT, ONELINK_CONTRACT_ADDRESS, oneLinkCollectAbi } from "@/lib/contracts";
import { amountToUnits, makeContractLinkId, makeSlug, paymentPath, shortAddress, type PaymentLink } from "@/lib/payments";
import { normalizeHandle, profileClaimMessage, saveFreelancerProfile } from "@/lib/profiles";
import { HAS_SHARED_STORAGE, savePaymentLink, saveVerifiedInvoiceLink } from "@/lib/storage";

const AMOUNT_RE = /^\d+(\.\d{1,6})?$/;
const MAX_USDC = 1_000_000;
type ExpiryPreset = "never" | "1d" | "7d" | "30d" | "custom";

function statusPill(status: "unpaid" | "paid") {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-2 text-[20px] font-semibold text-white/88">
      <span className={status === "paid" ? "size-3 rounded-full bg-lime" : "size-3 rounded-full bg-white/75"} />
      {status === "paid" ? "Paid" : "Unpaid"}
    </span>
  );
}

export function CreateLinkForm() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const arcClient = usePublicClient({ chainId: ARC_CHAIN_ID });
  const { signMessageAsync } = useSignMessage();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [memo, setMemo] = useState("");
  const [handle, setHandle] = useState("");
  const [expiryPreset, setExpiryPreset] = useState<ExpiryPreset>("7d");
  const [customExpiry, setCustomExpiry] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editingRecipient, setEditingRecipient] = useState(false);

  const normalizedRecipient = useMemo(() => {
    if (recipient.trim()) return recipient.trim();
    return address ?? "";
  }, [address, recipient]);

  const previewExpiry = useMemo(() => {
    if (expiryPreset === "never") return "Never";
    if (expiryPreset === "1d") return "1D";
    if (expiryPreset === "7d") return "7D";
    if (expiryPreset === "30d") return "30D";
    if (expiryPreset === "custom") {
      if (!customExpiry) return "Custom";
      const d = new Date(customExpiry);
      return Number.isFinite(d.getTime()) ? `${d.toDateString()}` : "Custom";
    }
    return "7D";
  }, [customExpiry, expiryPreset]);

  function deriveExpiresAt(): string {
    const now = new Date();
    if (expiryPreset === "never") return "";
    if (expiryPreset === "custom") return customExpiry;

    const d = new Date(now);
    if (expiryPreset === "1d") d.setDate(now.getDate() + 1);
    if (expiryPreset === "7d") d.setDate(now.getDate() + 7);
    if (expiryPreset === "30d") d.setDate(now.getDate() + 30);
    return d.toISOString().slice(0, 16);
  }

  async function createLink() {
    setError("");

    if (!isConnected || !address) {
      setError("Connect a wallet to create a testnet payment link.");
      return;
    }

    if (!isAddress(normalizedRecipient)) {
      setError("Enter a valid recipient wallet address (0x… 42 chars).");
      return;
    }

    if (!AMOUNT_RE.test(amount)) {
      setError("Amount must be a number with up to 6 decimals.");
      return;
    }

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError("Amount must be greater than 0 USDC.");
      return;
    }
    if (amountNum > MAX_USDC) {
      setError(`Amount is capped at ${MAX_USDC.toLocaleString()} USDC per link.`);
      return;
    }

    if (memo.trim().length === 0) {
      setError("Memo can't be empty.");
      return;
    }

    const expiresAt = deriveExpiresAt();
    let expirySeconds = 0;
    if (expiresAt) {
      const expiryMs = new Date(expiresAt).getTime();
      if (!Number.isFinite(expiryMs)) {
        setError("Expiration date is invalid.");
        return;
      }
      if (expiryMs <= Date.now()) {
        setError("Expiration must be in the future.");
        return;
      }
      expirySeconds = Math.floor(expiryMs / 1000);
    }

    let checksummedRecipient: Address;
    try {
      checksummedRecipient = getAddress(normalizedRecipient);
    } catch {
      setError("Recipient address failed checksum validation.");
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

      const permanentHandle = normalizeHandle(handle);
      if (permanentHandle) {
        if (checksummedRecipient.toLowerCase() !== address.toLowerCase()) {
          throw new Error("A permanent handle must receive funds in your connected wallet.");
        }
        const signature = await signMessageAsync({
          message: profileClaimMessage(permanentHandle, checksummedRecipient),
        });
        await saveFreelancerProfile({
          handle: permanentHandle,
          wallet: checksummedRecipient,
          displayName: permanentHandle,
          createdAt: now,
          updatedAt: now,
        }, signature);
      }

      let createHash: `0x${string}` | undefined;
      if (HAS_CONTRACT) {
        if (!arcClient) throw new Error("Arc RPC client is not available.");
        createHash = await writeContractAsync({
          address: ONELINK_CONTRACT_ADDRESS,
          abi: oneLinkCollectAbi,
          functionName: "createLink",
          args: [contractLinkId, checksummedRecipient, amountToUnits(amount), BigInt(expirySeconds)],
        });
        const receipt = await arcClient.waitForTransactionReceipt({ hash: createHash });
        if (receipt.status !== "success") throw new Error("Arc link creation transaction failed.");
      }

      const link: PaymentLink = {
        id: crypto.randomUUID(),
        slug,
        creatorWallet: address,
        recipientWallet: checksummedRecipient,
        amountUSDC: amount,
        memo: memo.trim(),
        status: "unpaid",
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        contractLinkId,
        createdAt: now,
        updatedAt: now,
      };

      if (HAS_CONTRACT && HAS_SHARED_STORAGE && createHash) {
        await saveVerifiedInvoiceLink(link, createHash);
      } else {
        await savePaymentLink(link);
      }
      router.push(paymentPath(slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create link.");
    } finally {
      setBusy(false);
    }
  }

  const recipientDisplay = isAddress(normalizedRecipient)
    ? shortAddress(getAddress(normalizedRecipient))
    : isConnected
      ? "Recipient required"
      : "Connect wallet";
  const isOwnRecipient =
    !!address && isAddress(normalizedRecipient) && normalizedRecipient.toLowerCase() === address.toLowerCase();
  const [recipientHead, recipientTail = ""] = recipientDisplay.split("…");

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-7 xl:grid-cols-[minmax(0,0.983fr)_minmax(0,1.017fr)] xl:px-14 xl:pt-10">
      <section className="min-w-0 space-y-5 xl:-translate-y-[25px] xl:pr-[83px]">
        <p className="mono-label text-[15px]">Step 1 of 1</p>

        <div className="space-y-5 xl:space-y-8">
          <h1 className="text-balance text-[48px] font-medium leading-[0.96] tracking-[-0.035em] sm:text-[64px]">
            Create a payment link
          </h1>
          <p className="max-w-[780px] text-[19px] leading-[1.5] text-white/55 sm:text-[25px] sm:leading-[1.42]">
            Set an amount, write a memo, and share the link. Recipient defaults to your connected
            wallet.
          </p>
        </div>

        <div className="space-y-7 pt-6 sm:space-y-6 sm:pt-9 xl:space-y-4 xl:pt-[30px]">
          <label className="block space-y-4">
            <span className="text-[18px] font-semibold text-white/62 sm:text-[21px]">Amount</span>
            <div className="flex h-[96px] min-w-0 items-center justify-between rounded-[20px] border border-white/10 bg-[#1A1A1E] px-5 sm:h-[130px] sm:rounded-[24px] sm:px-9">
              <input
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                className="min-w-0 w-full bg-transparent text-[38px] font-medium leading-none tracking-[-0.03em] text-snow outline-none placeholder:text-white/25 sm:text-[48px]"
              />
              <span className="ml-3 inline-flex shrink-0 items-center gap-2 text-[17px] font-semibold text-white/62 sm:ml-4 sm:gap-4 sm:text-[24px]">
                <span className="grid size-7 place-items-center rounded-full bg-[#2476d4] text-[17px] font-semibold text-white sm:size-8 sm:text-[20px]">
                  $
                </span>
                USDC
              </span>
            </div>
          </label>

          <label className="block space-y-4">
            <span className="text-[18px] font-semibold text-white/62 sm:text-[21px]">Memo</span>
            <input
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="Invoice description"
              className="h-[72px] w-full rounded-[20px] border border-white/10 bg-[#1A1A1E] px-5 text-[18px] font-medium text-snow outline-none sm:h-[88px] sm:rounded-[24px] sm:px-8 sm:text-[24px]"
            />
          </label>

          <div className="space-y-4">
            <span className="text-[18px] font-semibold text-white/62 sm:text-[21px]">Recipient</span>
            <div className="rounded-[20px] border border-white/10 bg-[#1A1A1E] px-5 py-4 sm:rounded-[24px] sm:px-8 sm:py-5">
              {editingRecipient ? (
                <div className="space-y-4">
                  <input
                    value={recipient}
                    onChange={(event) => setRecipient(event.target.value)}
                    placeholder={address ?? "0x..."}
                    className="h-16 w-full rounded-2xl border border-white/12 bg-black/20 px-5 text-2xl text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingRecipient(false)}
                    className="text-xl text-lime"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-4">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <span className="size-9 shrink-0 rounded-full bg-[#44454c] sm:size-12" />
                    <p className="shrink-0 text-[18px] leading-[1.15] sm:text-[24px]">
                      {recipientTail ? (
                        <>
                          {recipientHead}…
                          <br />
                          {recipientTail}
                        </>
                      ) : (
                        recipientDisplay
                      )}
                    </p>
                    {isOwnRecipient && (
                      <span className="rounded-lg border border-white/10 bg-white/8 px-2 py-1.5 text-[12px] text-white/70 sm:rounded-xl sm:px-3 sm:text-[16px]">
                        YOU
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingRecipient(true)}
                    className="shrink-0 text-[15px] text-white/45 hover:text-white sm:text-[22px]"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          </div>

          <label className="block space-y-4">
            <span className="text-[18px] font-semibold text-white/62 sm:text-[21px]">Permanent handle (optional)</span>
            <input
              value={handle}
              onChange={(event) => setHandle(normalizeHandle(event.target.value))}
              placeholder="designer"
              className="h-[72px] w-full rounded-[20px] border border-white/10 bg-[#1A1A1E] px-5 text-[18px] font-medium text-snow outline-none sm:h-[88px] sm:rounded-[24px] sm:px-8 sm:text-[24px]"
            />
            {handle && (
              <p className="text-[16px] text-white/48">
                Reusable profile: {process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/{handle}
              </p>
            )}
          </label>

          <div className="space-y-4">
            <span className="text-[18px] font-semibold text-white/62 sm:text-[21px]">Expiry (optional)</span>
            <div className="rounded-[20px] border border-white/10 bg-[#1A1A1E] p-2 sm:rounded-[22px] sm:p-3">
              <div className="grid grid-cols-5 gap-2">
                {(["never", "1d", "7d", "30d", "custom"] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setExpiryPreset(preset)}
                    className={`h-[48px] rounded-[12px] text-[14px] font-medium sm:h-[54px] sm:rounded-[14px] sm:text-[21px] ${
                      expiryPreset === preset ? "bg-ink text-snow" : "text-white/65"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            {expiryPreset === "custom" && (
              <input
                type="datetime-local"
                value={customExpiry}
                onChange={(event) => setCustomExpiry(event.target.value)}
                className="h-16 w-full rounded-2xl border border-white/12 bg-[#1A1A1E] px-5 text-2xl text-white outline-none"
              />
            )}
          </div>

          {error && (
            <div className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-xl text-[#ffc5c5]">
              {error}
            </div>
          )}

          {isConnected ? (
            <button
              type="button"
              onClick={createLink}
              disabled={busy}
              className="inline-flex h-[72px] w-full items-center justify-center rounded-[20px] bg-lime text-[22px] font-medium tracking-tight text-ink disabled:opacity-45 sm:h-[88px] sm:rounded-[24px] sm:text-[28px]"
            >
              {busy ? "Signing..." : "Sign & create link"}
            </button>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  type="button"
                  onClick={openConnectModal}
                  className="inline-flex h-[72px] w-full items-center justify-center rounded-[20px] bg-lime text-[22px] font-medium tracking-tight text-ink sm:h-[88px] sm:rounded-[24px] sm:text-[28px]"
                >
                  Connect wallet to create
                </button>
              )}
            </ConnectButton.Custom>
          )}
        </div>
      </section>

      <aside className="relative min-w-0 xl:sticky xl:top-[110px] xl:-mt-[97px] xl:h-fit xl:-translate-y-[91px] xl:pl-[121px] xl:before:absolute xl:before:-bottom-[400px] xl:before:-top-[102px] xl:before:left-0 xl:before:w-px xl:before:bg-white/10">
        <p className="mono-label mb-4 text-[16px]">Preview</p>
        <article className="surface relative min-w-0 overflow-hidden rounded-[26px] p-6 sm:rounded-[34px] sm:px-12 sm:pb-8 sm:pt-12">
          <div className="mt-1 flex items-center justify-start">
            <RingIcon className="h-10 w-10 text-lime" />
          </div>
          <span className="pointer-events-none absolute right-5 top-[28px] sm:right-14 sm:top-[52px]">{statusPill("unpaid")}</span>

          <p className="mono-label mt-10 text-[12px] sm:mt-14 sm:text-[14px]">Amount due</p>
          <div className="mt-5 flex items-end gap-3">
            <p className="text-[clamp(66px,6vw,116px)] leading-none tracking-[-0.04em]">
              {Number.isFinite(Number(amount)) ? Number(amount).toFixed(2) : amount || "0.00"}
            </p>
            <span className="pb-2 text-[19px] text-white/55 sm:text-[31px]">USDC</span>
          </div>

          <p className="mono-label mt-8 text-[14px]">For</p>
          <p className="mt-3 text-[24px] font-medium leading-[1.07] tracking-tight">
            {memo.trim() || "Describe this payment request"}
          </p>

          <div className="mt-8 border-t border-white/10 pt-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="size-14 rounded-full bg-[#44454c]" />
                <div>
                  <p className="text-[22px] font-medium text-white/82">{recipientDisplay}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="mono-label text-[13px]">Expires in</p>
                <p className="mt-1 text-[22px] font-medium text-white/82">{previewExpiry}</p>
              </div>
            </div>
          </div>
        </article>
      </aside>
    </div>
  );
}
