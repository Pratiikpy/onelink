"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import {
  Copy,
  ExternalLink,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Search,
  Share2,
  X,
} from "lucide-react";

import { AppNav } from "@/components/onelink/nav";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { StatusBadge } from "@/components/onelink/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ARC_CHAIN_ID } from "@/lib/arc";
import {
  HAS_CONTRACT,
  ONELINK_CONTRACT_ADDRESS,
  oneLinkCollectAbi,
} from "@/lib/contracts";
import {
  paymentPath,
  receiptPath,
  type PaymentLink,
  type PaymentStatus,
} from "@/lib/payments";
import {
  confirmCancelledPayment,
  listPaymentLinks,
  updatePaymentStatus,
} from "@/lib/storage";
import { formatUSDC, relativeTime, truncateAddr } from "@/lib/format";
import { shareOrCopy } from "@/lib/share";
import { cn } from "@/lib/utils";

type TabFilter = "all" | PaymentStatus;

export function DashboardClient() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const arcClient = usePublicClient({ chainId: ARC_CHAIN_ID });

  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  // A failed Supabase/RLS read must not masquerade as the empty "No links yet"
  // state — surface it explicitly so the user knows to retry vs. create a link.
  const [loadError, setLoadError] = useState("");
  // Bumping this re-triggers the load effect (used by the "Try again" action).
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState<TabFilter>("all");
  const [q, setQ] = useState("");
  // Cancel confirmation: track which link is pending cancellation and whether
  // the on-chain cancel transaction is in flight. Without an explicit confirm
  // step, an accidental click in the row dropdown costs gas and is irreversible.
  const [pendingCancel, setPendingCancel] = useState<PaymentLink | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!address) {
      setLinks([]);
      setLoadError("");
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError("");
    listPaymentLinks(address)
      .then((rows) => {
        if (!cancelled) setLinks(rows);
      })
      .catch((err) => {
        console.error("Failed to load payment links", err);
        if (!cancelled) {
          setLinks([]);
          setLoadError(
            "We couldn't reach your link history. Check your connection and try again.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address, reloadKey]);

  const visible = useMemo(() => {
    let r = links;
    if (tab !== "all") r = r.filter((l) => l.status === tab);
    if (q) {
      const lower = q.toLowerCase();
      r = r.filter(
        (l) => l.memo.toLowerCase().includes(lower) || l.slug.includes(lower),
      );
    }
    return r;
  }, [links, tab, q]);

  const kpis = useMemo(() => {
    const totalSettled = links
      .filter((l) => l.status === "paid")
      .reduce((s, l) => s + Number(l.amountUSDC || 0), 0);
    const open = links.filter((l) => l.status === "unpaid" || l.status === "processing").length;
    const paidThisMonth = links.filter((l) => {
      if (l.status !== "paid") return false;
      const d = new Date(l.updatedAt);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;

    // Sparkline: last 14 days, count of paid links per day.
    const days = 14;
    const counts = Array.from({ length: days }, () => 0);
    const todayUtc = new Date();
    for (const l of links) {
      if (l.status !== "paid") continue;
      const d = new Date(l.updatedAt);
      const diff = Math.floor(
        (todayUtc.getTime() - d.getTime()) / (24 * 60 * 60 * 1000),
      );
      if (diff >= 0 && diff < days) counts[days - 1 - diff] += 1;
    }
    return { totalSettled, open, paidThisMonth, sparkline: counts };
  }, [links]);

  async function copyLink(slug: string) {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${paymentPath(slug)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  }

  async function shareLink(link: PaymentLink) {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${paymentPath(link.slug)}`;
    const result = await shareOrCopy({
      title: `${link.amountUSDC} USDC · OneLink`,
      text: link.memo,
      url,
    });
    if (result === "copied") toast.success("Link copied");
    else if (result === "failed") toast.error("Couldn't share link");
  }

  async function cancelLink(link: PaymentLink) {
    if (!address) return;
    setCancelBusy(true);
    try {
      if (!HAS_CONTRACT) {
        const updated = await updatePaymentStatus(link.id, "cancelled", {
          payerWallet: undefined,
          paymentMethod: link.paymentMethod,
          sourceChain: link.sourceChain,
        });
        if (updated) setLinks((cur) => cur.map((x) => (x.id === updated.id ? updated : x)));
        toast.success("Demo: link marked cancelled");
        setPendingCancel(null);
        return;
      }
      if (!arcClient) {
        toast.error("Arc RPC client unavailable");
        setPendingCancel(null);
        return;
      }
      const txHash = await writeContractAsync({
        address: ONELINK_CONTRACT_ADDRESS,
        abi: oneLinkCollectAbi,
        functionName: "cancelLink",
        args: [link.contractLinkId],
      });
      const receipt = await arcClient.waitForTransactionReceipt({ hash: txHash });
      if (receipt.status !== "success") throw new Error("Arc cancel transaction failed");
      const updated = await confirmCancelledPayment(link.id, txHash);
      if (updated) setLinks((cur) => cur.map((x) => (x.id === updated.id ? updated : x)));
      toast.success("Link cancelled on Arc");
      setPendingCancel(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
      setPendingCancel(null);
    } finally {
      setCancelBusy(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background page-in">
        <AppNav />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em]">
            Connect your wallet to see your links
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your links stay private to your wallet — no signup needed.
          </p>
          <div className="mt-7 flex flex-col items-center gap-2">
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button variant="brand" size="lg" onClick={openConnectModal}>
                  Connect wallet
                </Button>
              )}
            </ConnectButton.Custom>
            <Button variant="link" asChild>
              <Link href="/create">or create a link &rarr;</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-in">
      <AppNav />
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Overview
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] md:text-[40px]">
              Payment links
            </h1>
            {address && (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {truncateAddr(address)}
              </p>
            )}
          </div>
          <Link
            href="/create"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-transform hover:-translate-y-px"
          >
            <Plus className="h-4 w-4" /> New link
          </Link>
        </div>

        {/* KPIs */}
        <div className="mt-10 grid grid-cols-2 divide-x divide-hairline border-y border-hairline lg:grid-cols-4">
          <Kpi
            label="Total settled"
            value={`$${formatUSDC(kpis.totalSettled)}`}
            sub="USDC, all-time"
            sparkline={kpis.sparkline}
          />
          <Kpi label="Open links" value={String(kpis.open)} sub="Unpaid + processing" />
          <Kpi label="Paid this month" value={String(kpis.paidThisMonth)} sub="Last 30 days" />
          <Kpi
            label="Total links"
            value={String(links.length)}
            sub="Created by you"
          />
        </div>

        {/* Tabs + search */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            {(["all", "unpaid", "paid", "cancelled", "expired"] as TabFilter[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-sm capitalize transition-colors",
                  tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
                {tab === t && (
                  <span className="absolute -bottom-[13px] left-3 right-3 h-px bg-foreground" />
                )}
              </button>
            ))}
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search memo or slug"
              aria-label="Search links"
              className="h-9 w-full rounded-md border border-hairline bg-surface pl-8 pr-3 text-base outline-none focus:border-foreground/40 md:text-sm"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="mt-6 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-md border border-hairline bg-surface shimmer" />
            ))}
          </div>
        ) : loadError ? (
          <ErrorState message={loadError} onRetry={() => setReloadKey((k) => k + 1)} />
        ) : visible.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Desktop: table */}
            <div className="mt-6 hidden overflow-hidden rounded-xl border border-hairline bg-surface md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-hairline bg-muted/40">
                  <tr className="text-left font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Memo</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="hidden px-4 py-3 font-medium md:table-cell">Payer</th>
                    <th className="hidden px-4 py-3 font-medium md:table-cell">Created</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {visible.map((l) => (
                    <tr key={l.id} className="group transition-colors hover:bg-muted/30">
                      <td className="max-w-[16rem] px-4 py-4">
                        <p className="truncate font-medium">{l.memo}</p>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                          /{l.slug}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right font-mono tabular-nums">
                        {formatUSDC(l.amountUSDC)}{" "}
                        <span className="text-muted-foreground">USDC</span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="hidden px-4 py-4 font-mono text-xs text-muted-foreground md:table-cell">
                        {l.payerWallet ? truncateAddr(l.payerWallet) : "—"}
                      </td>
                      <td className="hidden px-4 py-4 text-xs text-muted-foreground md:table-cell">
                        {relativeTime(l.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label="Link actions"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => copyLink(l.slug)}>
                              <Copy className="mr-2 h-3.5 w-3.5" /> Copy link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => shareLink(l)}>
                              <Share2 className="mr-2 h-3.5 w-3.5" /> Share link
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={paymentPath(l.slug)}>
                                <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open pay page
                              </Link>
                            </DropdownMenuItem>
                            {l.status === "paid" && (
                              <DropdownMenuItem asChild>
                                <Link href={receiptPath(l.id)}>View receipt</Link>
                              </DropdownMenuItem>
                            )}
                            {l.status === "unpaid" && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setPendingCancel(l)}
                              >
                                Cancel link
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked cards */}
            <div className="mt-6 space-y-3 md:hidden">
              {visible.map((l) => (
                <div
                  key={l.id}
                  className="rounded-xl border border-hairline bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-lg font-semibold tabular-nums">
                        {formatUSDC(l.amountUSDC)}{" "}
                        <span className="text-sm font-normal text-muted-foreground">USDC</span>
                      </p>
                      <p className="mt-1 truncate text-sm font-medium">{l.memo}</p>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                        /{l.slug}
                      </p>
                    </div>
                    <StatusBadge status={l.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(l.slug)}
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => shareLink(l)}
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </Button>
                    {l.status === "paid" ? (
                      <Button asChild size="sm">
                        <Link href={receiptPath(l.id)}>
                          <ReceiptText className="h-3.5 w-3.5" /> Receipt
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm">
                        <Link href={paymentPath(l.slug)}>
                          <ExternalLink className="h-3.5 w-3.5" /> Open
                        </Link>
                      </Button>
                    )}
                    {l.status === "unpaid" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setPendingCancel(l)}
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <ConfirmDialog
        open={pendingCancel !== null}
        title="Cancel this payment link?"
        body={
          pendingCancel
            ? `This will publish a cancelLink transaction on Arc Testnet for "${pendingCancel.memo}". The link will stop accepting payments and the action cannot be reversed. Gas is paid in USDC.`
            : ""
        }
        confirmLabel="Cancel link on Arc"
        cancelLabel="Keep link active"
        tone="danger"
        busy={cancelBusy}
        onConfirm={() => {
          if (pendingCancel) cancelLink(pendingCancel);
        }}
        onCancel={() => {
          if (!cancelBusy) setPendingCancel(null);
        }}
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  sparkline,
}: {
  label: string;
  value: string;
  sub: string;
  sparkline?: number[];
}) {
  return (
    <div className="px-6 py-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-[28px] font-semibold tracking-[-0.03em] tabular-nums">
        {value}
      </p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">{sub}</p>
        {sparkline && <Sparkline data={sparkline} />}
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const w = 72;
  const h = 22;
  const points = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * w;
    const y = h - ((v - min) / Math.max(1, max - min)) * h;
    return [x, y] as const;
  });
  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const last = points[points.length - 1];
  return (
    <svg width={w} height={h} className="text-foreground/80">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="1.75" fill="currentColor" />
    </svg>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/[0.05] px-6 py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-destructive/30">
        <X className="h-5 w-5 text-destructive" />
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">
        Couldn&rsquo;t load your links
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{message}</p>
      <div className="mt-6 flex justify-center">
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-hairline bg-surface px-6 py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-hairline">
        <Plus className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">
        No payment links yet
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Create your first USDC link — it takes about 30 seconds.
      </p>
      <div className="mt-7 flex justify-center">
        <Button asChild variant="brand" size="lg">
          <Link href="/create">Create your first link</Link>
        </Button>
      </div>
    </div>
  );
}
