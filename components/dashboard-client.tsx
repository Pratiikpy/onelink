"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { Check, Copy, ExternalLink, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { confirmCancelledPayment, listPaymentLinks } from "@/lib/storage";
import type { PaymentLink, PaymentStatus } from "@/lib/payments";
import { paymentPath, receiptPath, shortAddress } from "@/lib/payments";
import { ARC_CHAIN_ID } from "@/lib/arc";
import { ALLOW_DEMO_MODE, HAS_CONTRACT, ONELINK_CONTRACT_ADDRESS, oneLinkCollectAbi } from "@/lib/contracts";

const demoHash = (n: string) => (`0x${n.repeat(64)}` as `0x${string}`);

function makeDemoLinks(owner: `0x${string}`): PaymentLink[] {
  const now = Date.now();
  return [
    {
      id: "demo-1",
      slug: "9c3af80e",
      creatorWallet: owner,
      recipientWallet: owner,
      amountUSDC: "250.00",
      memo: "Branding work · invoice #0042",
      status: "paid",
      expiresAt: null,
      contractLinkId: demoHash("1"),
      createdAt: new Date(now - 6 * 3600 * 1000).toISOString(),
      updatedAt: new Date(now - 6 * 3600 * 1000).toISOString(),
    },
    {
      id: "demo-2",
      slug: "4d12a7c1",
      creatorWallet: owner,
      recipientWallet: owner,
      amountUSDC: "1200.00",
      memo: "Q1 retainer · final",
      status: "unpaid",
      expiresAt: new Date(now + 7 * 86400000).toISOString(),
      contractLinkId: demoHash("2"),
      createdAt: new Date(now - 2 * 3600 * 1000).toISOString(),
      updatedAt: new Date(now - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: "demo-3",
      slug: "b7f02e89",
      creatorWallet: owner,
      recipientWallet: owner,
      amountUSDC: "85.00",
      memo: "Landing-page review",
      status: "paid",
      expiresAt: null,
      contractLinkId: demoHash("3"),
      createdAt: new Date(now - 86400000).toISOString(),
      updatedAt: new Date(now - 86400000).toISOString(),
    },
    {
      id: "demo-4",
      slug: "aa9c1f5b",
      creatorWallet: owner,
      recipientWallet: owner,
      amountUSDC: "450.00",
      memo: "Logo + system · K. Mori",
      status: "processing",
      expiresAt: new Date(now + 5 * 86400000).toISOString(),
      contractLinkId: demoHash("4"),
      createdAt: new Date(now - 5 * 60000).toISOString(),
      updatedAt: new Date(now - 5 * 60000).toISOString(),
    },
    {
      id: "demo-5",
      slug: "02e6d4aa",
      creatorWallet: owner,
      recipientWallet: owner,
      amountUSDC: "60.00",
      memo: "Coffee chat consult",
      status: "expired",
      expiresAt: new Date(now - 5 * 86400000).toISOString(),
      contractLinkId: demoHash("5"),
      createdAt: new Date(now - 5 * 86400000).toISOString(),
      updatedAt: new Date(now - 5 * 86400000).toISOString(),
    },
    {
      id: "demo-6",
      slug: "6e1a8c30",
      creatorWallet: owner,
      recipientWallet: owner,
      amountUSDC: "320.00",
      memo: "Beta access · cohort 02",
      status: "paid",
      expiresAt: null,
      contractLinkId: demoHash("6"),
      createdAt: new Date(now - 3 * 86400000).toISOString(),
      updatedAt: new Date(now - 3 * 86400000).toISOString(),
    },
    {
      id: "demo-7",
      slug: "f6c3321a",
      creatorWallet: owner,
      recipientWallet: owner,
      amountUSDC: "1200.00",
      memo: "Enterprise migration · phase 01",
      status: "paid",
      expiresAt: null,
      contractLinkId: demoHash("7"),
      createdAt: new Date(now - 10 * 86400000).toISOString(),
      updatedAt: new Date(now - 8 * 86400000).toISOString(),
    },
  ];
}

function statusChip(status: PaymentStatus) {
  const map: Record<PaymentStatus, { dot: string; text: string; ring: string }> = {
    paid: { dot: "bg-lime", text: "text-lime", ring: "border-lime/20 bg-lime/10" },
    unpaid: { dot: "bg-white/65", text: "text-white", ring: "border-white/[0.08] bg-white/[0.04]" },
    processing: { dot: "bg-amber", text: "text-amber", ring: "border-amber/25 bg-amber/12" },
    failed: { dot: "bg-danger", text: "text-danger", ring: "border-danger/25 bg-danger/12" },
    expired: { dot: "bg-white/42", text: "text-white/60", ring: "border-white/[0.08] bg-white/[0.04]" },
    cancelled: { dot: "bg-white/42", text: "text-white/60", ring: "border-white/[0.08] bg-white/[0.04]" },
  };
  const tone = map[status];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[20px] font-semibold ${tone.text} ${tone.ring}`}
    >
      <span className={`size-3.5 rounded-full ${tone.dot}`} />
      {status[0]?.toUpperCase() + status.slice(1)}
    </span>
  );
}

function prettyTime(input: string) {
  const d = new Date(input).getTime();
  if (!Number.isFinite(d)) return "—";
  const diff = Date.now() - d;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 3) return `${hours}h ago`;
  const now = new Date();
  const date = new Date(input);
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    return `Today, ${hh}:${mm}`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(input).toLocaleDateString();
}

function money(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function visibleCreatorLinks(links: PaymentLink[]) {
  return links.filter((link) => link.settlementMode !== "profile" || link.status === "paid");
}

const RECENT_LINK_LIMIT = 12;

export function DashboardClient() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const arcClient = usePublicClient({ chainId: ARC_CHAIN_ID });
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<PaymentLink | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [showAllLinks, setShowAllLinks] = useState(false);

  useEffect(() => {
    async function load() {
      setLoadError("");
      const demoCreator = (address ?? "0x7a2f0000000000000000000000000000000091c4") as `0x${string}`;
      if (!isConnected) {
        setLinks(ALLOW_DEMO_MODE ? makeDemoLinks(demoCreator) : []);
        return;
      }

      try {
        const existing = visibleCreatorLinks(await listPaymentLinks(address));
        if (existing.length > 0) {
          setLinks(existing);
          return;
        }

        setLinks(ALLOW_DEMO_MODE ? makeDemoLinks(demoCreator) : []);
      } catch (err) {
        setLinks([]);
        setLoadError(err instanceof Error ? err.message : "Could not load payment links.");
      }
    }
    load();
  }, [address, isConnected]);

  const collected = useMemo(
    () => links.filter((link) => link.status === "paid").reduce((sum, link) => sum + Number(link.amountUSDC), 0),
    [links],
  );
  const outstanding = useMemo(
    () => links.filter((link) => link.status === "unpaid").reduce((sum, link) => sum + Number(link.amountUSDC), 0),
    [links],
  );
  const inflight = useMemo(
    () => links.filter((link) => link.status === "processing").reduce((sum, link) => sum + Number(link.amountUSDC), 0),
    [links],
  );

  const settledCount = links.filter((link) => link.status === "paid").length;
  const payRate = links.length === 0 ? 0 : Math.round((settledCount / links.length) * 100);
  const needsConnection = !isConnected && !ALLOW_DEMO_MODE;
  const displayedLinks = showAllLinks ? links : links.slice(0, RECENT_LINK_LIMIT);
  const hiddenLinkCount = Math.max(0, links.length - displayedLinks.length);

  async function copyPaymentLink(link: PaymentLink) {
    const href = `${window.location.origin}${paymentPath(link.slug)}`;
    await navigator.clipboard.writeText(href);
    setCopiedId(link.id);
    window.setTimeout(() => setCopiedId((current) => (current === link.id ? null : current)), 1600);
  }

  async function cancelPaymentLink() {
    if (!cancelTarget || !address) return;
    setActionError("");
    setCancelBusy(true);
    try {
      let txHash: `0x${string}` | undefined;
      if (HAS_CONTRACT) {
        if (!arcClient) throw new Error("Arc RPC client is not available.");
        if (chainId !== ARC_CHAIN_ID) await switchChainAsync({ chainId: ARC_CHAIN_ID });
        txHash = await writeContractAsync({
          address: ONELINK_CONTRACT_ADDRESS,
          abi: oneLinkCollectAbi,
          functionName: "cancelLink",
          args: [cancelTarget.contractLinkId],
        });
        const receipt = await arcClient.waitForTransactionReceipt({ hash: txHash });
        if (receipt.status !== "success") throw new Error("Arc cancellation transaction failed.");
      }
      const cancelled = await confirmCancelledPayment(cancelTarget.id, txHash);
      if (!cancelled) throw new Error("Could not reload the cancelled payment link.");
      setLinks((existing) => existing.map((link) => (link.id === cancelled.id ? cancelled : link)));
      setCancelTarget(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not cancel this payment link.");
    } finally {
      setCancelBusy(false);
    }
  }

  return (
    <div className="-mt-4 min-w-0 max-w-full space-y-8 overflow-hidden pb-8 sm:space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mono-label text-[15px]">Links · last 30 days</p>
          <h1 className="mt-4 text-[48px] font-medium tracking-[-0.035em] sm:text-[62px]">Your links</h1>
        </div>
        <Link
          href="/create"
          className="mb-1 inline-flex h-[64px] min-w-[150px] items-center justify-center rounded-[18px] bg-lime px-7 text-[21px] font-medium tracking-tight text-ink sm:h-[78px] sm:min-w-[190px] sm:rounded-[20px] sm:px-9 sm:text-[26px]"
        >
          + New link
        </Link>
      </div>

      {needsConnection ? (
        <section className="surface relative overflow-hidden rounded-[30px] px-7 py-12 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(201,242,103,0.16),transparent_68%)]" />
          <p className="mono-label text-[13px]">Wallet workspace</p>
          <h2 className="relative mt-5 max-w-[680px] text-[40px] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[56px]">
            Connect to see your payment links
          </h2>
          <p className="relative mt-5 max-w-[600px] text-[18px] leading-7 text-white/55 sm:text-[22px]">
            Connect the creator wallet to load its collected balance, outstanding invoices, and
            verified receipts in this view.
          </p>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                type="button"
                onClick={openConnectModal}
                className="relative mt-9 inline-flex h-[64px] items-center justify-center rounded-[19px] bg-lime px-8 text-[21px] font-medium text-ink sm:h-[72px] sm:px-10 sm:text-[23px]"
              >
                Connect wallet
              </button>
            )}
          </ConnectButton.Custom>
        </section>
      ) : (
        <>
      {actionError && (
        <div className="rounded-[18px] border border-danger/30 bg-danger/10 px-5 py-4 text-[16px] text-[#ffc5c5]">
          {actionError}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-4">
        <article className="surface relative h-[176px] overflow-hidden rounded-[22px] p-6 sm:h-[208px] sm:rounded-[24px] sm:p-7">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(201,242,103,0.26),transparent_72%)]" />
          <p className="mono-label text-[13px]">Collected</p>
          <p className="mt-5 text-[42px] font-medium tracking-tight text-lime sm:mt-6 sm:text-[52px]">${money(collected)}</p>
          <p className="mt-2 text-[18px] text-white/58 sm:text-[22px]">Across {settledCount} links · Arc</p>
        </article>

        <article className="surface h-[176px] rounded-[22px] p-6 sm:h-[208px] sm:rounded-[24px] sm:p-7">
          <p className="mono-label text-[13px]">Outstanding</p>
          <p className="mt-5 text-[42px] font-medium tracking-tight sm:mt-6 sm:text-[52px]">${money(outstanding)}</p>
          <p className="mt-2 text-[18px] text-white/58 sm:text-[22px]">
            {links.filter((link) => link.status === "unpaid").length} link unpaid
          </p>
        </article>

        <article className="surface h-[176px] rounded-[22px] p-6 sm:h-[208px] sm:rounded-[24px] sm:p-7">
          <p className="mono-label text-[13px]">In flight</p>
          <p className="mt-5 text-[42px] font-medium tracking-tight sm:mt-6 sm:text-[52px]">${money(inflight)}</p>
          <p className="mt-2 text-[18px] text-white/58 sm:text-[22px]">
            {links.filter((link) => link.status === "processing").length} processing
          </p>
        </article>

        <article className="surface h-[176px] rounded-[22px] p-6 sm:h-[208px] sm:rounded-[24px] sm:p-7">
          <p className="mono-label text-[13px]">Pay rate</p>
          <p className="mt-5 text-[42px] font-medium tracking-tight sm:mt-6 sm:text-[52px]">{payRate}%</p>
          <p className="mt-2 text-[18px] text-white/58 sm:text-[22px]">
            {settledCount} of {links.length} settled
          </p>
        </article>
      </div>

      <section className="surface hidden max-w-full overflow-x-auto rounded-[24px] p-0 lg:block">
        <div className="min-w-[1120px]">
        <div className="grid grid-cols-[minmax(260px,1.15fr)_minmax(300px,1fr)_150px_150px_180px] border-b border-white/10 px-8 py-7 text-[13px]">
          <p className="mono-label">Memo</p>
          <p className="mono-label">Link</p>
          <p className="mono-label">Status</p>
          <p className="mono-label">Updated</p>
          <p className="mono-label">Actions</p>
        </div>

        <div className="divide-y divide-white/10">
          {loadError && (
            <div className="px-10 py-8 text-[22px] text-[#ffc5c5]">{loadError}</div>
          )}

          {!loadError && links.length === 0 && (
            <div className="px-6 py-10 text-[34px] text-white/58">No links yet. Create your first one.</div>
          )}

          {displayedLinks.map((link) => (
            <div
              key={link.id}
              className="grid grid-cols-[minmax(260px,1.15fr)_minmax(300px,1fr)_150px_150px_180px] items-center gap-4 px-8 py-6"
            >
              <div className="min-w-0">
                <p className="truncate text-[22px]">{link.memo}</p>
                <p className="mt-1 whitespace-nowrap text-[15px] font-medium text-white/38">
                  {money(Number(link.amountUSDC))} USDC
                </p>
              </div>
              <Link href={paymentPath(link.slug)} className="truncate font-mono text-[20px] text-white/45 hover:text-white">
                {paymentPath(link.slug)}
              </Link>
              <div>{statusChip(link.status)}</div>
              <p className="text-[20px] text-white/45">
                {prettyTime(link.updatedAt)}
              </p>
              <div className="flex items-center gap-2 text-white/55">
                <button
                  type="button"
                  onClick={() => copyPaymentLink(link)}
                  aria-label="Copy payment link"
                  className="grid size-10 place-items-center rounded-xl border border-white/10 transition hover:border-lime/40 hover:text-lime"
                >
                  {copiedId === link.id ? <Check className="size-5 text-lime" /> : <Copy className="size-5" />}
                </button>
                <Link
                  href={paymentPath(link.slug)}
                  aria-label="Open payment link"
                  className="grid size-10 place-items-center rounded-xl border border-white/10 transition hover:border-lime/40 hover:text-lime"
                >
                  <ExternalLink className="size-5" />
                </Link>
                {link.status === "paid" && (
                  <Link
                    href={receiptPath(link.id)}
                    className="rounded-xl border border-white/10 px-3 py-2 text-[13px] transition hover:border-lime/40 hover:text-lime"
                  >
                    Receipt
                  </Link>
                )}
                {link.status === "unpaid" && link.settlementMode !== "profile" && (
                  <button
                    type="button"
                    onClick={() => setCancelTarget(link)}
                    aria-label="Cancel payment link"
                    className="grid size-10 place-items-center rounded-xl border border-white/10 transition hover:border-danger/40 hover:text-danger"
                  >
                    <Trash2 className="size-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {links.length > RECENT_LINK_LIMIT && (
          <div className="flex items-center justify-end border-t border-white/10 px-8 py-5">
            <button
              type="button"
              onClick={() => setShowAllLinks((value) => !value)}
              className="rounded-xl border border-white/10 px-4 py-2 text-[15px] text-white/70 transition hover:border-lime/40 hover:text-lime"
            >
              {showAllLinks ? "Show less" : `Show all ${hiddenLinkCount} more`}
            </button>
          </div>
        )}
        </div>
      </section>

      <section className="space-y-3 lg:hidden">
        {loadError && <div className="surface rounded-[22px] px-5 py-6 text-[#ffc5c5]">{loadError}</div>}
        {!loadError && links.length === 0 && (
          <div className="surface rounded-[22px] px-5 py-8 text-[20px] text-white/58">
            No links yet. Create your first one.
          </div>
        )}
        {displayedLinks.map((link) => (
          <article key={link.id} className="surface space-y-5 rounded-[22px] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[26px] font-medium tracking-tight">{money(Number(link.amountUSDC))} <span className="text-[14px] text-white/42">USDC</span></p>
                <p className="mt-2 text-[16px] text-white/70">{link.memo}</p>
              </div>
              <div className="[&>span]:px-3 [&>span]:py-2 [&>span]:text-[13px] [&_span_span]:size-2">
                {statusChip(link.status)}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <p className="text-[14px] text-white/45">{prettyTime(link.updatedAt)}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyPaymentLink(link)}
                  aria-label="Copy payment link"
                  className="grid size-11 place-items-center rounded-xl border border-white/10 text-white/62"
                >
                  {copiedId === link.id ? <Check className="size-5 text-lime" /> : <Copy className="size-5" />}
                </button>
                <Link
                  href={link.status === "paid" ? receiptPath(link.id) : paymentPath(link.slug)}
                  className="inline-flex h-11 items-center rounded-xl border border-white/10 px-4 text-[14px] text-white/76"
                >
                  {link.status === "paid" ? "Receipt" : "Open"}
                </Link>
                {link.status === "unpaid" && link.settlementMode !== "profile" && (
                  <button
                    type="button"
                    onClick={() => setCancelTarget(link)}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-[14px] text-white/62"
                  >
                    <Trash2 className="size-4" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
        {links.length > RECENT_LINK_LIMIT && (
          <button
            type="button"
            onClick={() => setShowAllLinks((value) => !value)}
            className="surface w-full rounded-[18px] px-5 py-4 text-[15px] text-white/70"
          >
            {showAllLinks ? "Show less" : `Show ${hiddenLinkCount} older links`}
          </button>
        )}
      </section>

      <p className="text-[19px] text-white/45 sm:text-[28px]">
        {isConnected ? `Signed in as ${shortAddress(address)}` : "Preview data - demo mode explicitly enabled"}
      </p>
        </>
      )}
      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel payment link?"
        body="This signs an Arc Testnet transaction and permanently stops payment on this invoice. This action cannot be undone."
        confirmLabel="Cancel link"
        busy={cancelBusy}
        onConfirm={cancelPaymentLink}
        onCancel={() => {
          if (!cancelBusy) setCancelTarget(null);
        }}
      />
    </div>
  );
}
