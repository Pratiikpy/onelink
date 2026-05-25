"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount, useChainId, useSwitchChain, useWriteContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Check, Copy, ExternalLink, Loader2, RefreshCw, WalletCards, X } from "lucide-react";
import { Button, Card, Pill } from "@/components/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { listPaymentLinks, updatePaymentStatus } from "@/lib/storage";
import type { PaymentLink } from "@/lib/payments";
import { shortAddress, statusTone } from "@/lib/payments";
import { useCopy } from "@/lib/share";
import { ARC_CHAIN_ID } from "@/lib/arc";
import { HAS_CONTRACT, ONELINK_CONTRACT_ADDRESS, oneLinkCollectAbi } from "@/lib/contracts";

export function DashboardClient() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<PaymentLink | null>(null);
  const [error, setError] = useState("");
  const { copy } = useCopy();

  async function copyLink(id: string, url: string) {
    const ok = await copy(url);
    if (ok) {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
    }
  }

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setLinks(await listPaymentLinks(address));
    } finally {
      setRefreshing(false);
    }
  }, [address]);

  async function performCancel() {
    if (!confirmTarget) return;
    const link = confirmTarget;
    setError("");
    setCancellingId(link.id);
    try {
      if (HAS_CONTRACT) {
        if (chainId !== ARC_CHAIN_ID) {
          await switchChainAsync({ chainId: ARC_CHAIN_ID });
        }
        await writeContractAsync({
          address: ONELINK_CONTRACT_ADDRESS,
          abi: oneLinkCollectAbi,
          functionName: "cancelLink",
          args: [link.contractLinkId],
        });
      }
      await updatePaymentStatus(link.id, "cancelled");
      setConfirmTarget(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel link.");
      setConfirmTarget(null);
    } finally {
      setCancellingId(null);
    }
  }

  useEffect(() => {
    refresh();
  }, [refresh]);

  const total = useMemo(
    () =>
      links
        .filter((link) => link.status === "paid")
        .reduce((sum, link) => sum + Number(link.amountUSDC), 0),
    [links],
  );

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <Card className="space-y-4 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-violet/30 bg-violet/10">
            <WalletCards className="size-6 text-violet" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Connect a wallet</h1>
            <p className="mt-2 text-sm font-semibold text-white/55">
              Your dashboard shows the collection links you created with the connected wallet.
            </p>
          </div>
          <div className="flex justify-center pt-1">
            <ConnectButton />
          </div>
          <Link href="/">
            <Button variant="secondary" className="mx-auto">
              Or create a link first
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Pill>Receiver dashboard</Pill>
          <h1 className="mt-3 text-4xl font-black tracking-tighter2 text-white">Your collection links</h1>
          <p className="mt-2 text-white/52">Status pulled from on-chain settlement and local cache.</p>
        </div>
        <Button
          variant="secondary"
          onClick={refresh}
          disabled={refreshing}
          aria-label="Refresh links"
        >
          {refreshing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-bold text-white/42">Total collected</p>
          <p className="mt-2 text-3xl font-black">{total.toFixed(2)} USDC</p>
        </Card>
        <Card>
          <p className="text-sm font-bold text-white/42">Links</p>
          <p className="mt-2 text-3xl font-black">{links.length}</p>
        </Card>
        <Card>
          <p className="text-sm font-bold text-white/42">Paid</p>
          <p className="mt-2 text-3xl font-black">
            {links.filter((link) => link.status === "paid").length}
          </p>
        </Card>
      </div>

      <div className="space-y-3">
        {links.length === 0 && (
          <Card className="text-center">
            <p className="text-xl font-black">No links yet</p>
            <p className="mt-2 text-sm text-white/50">Create your first USDC collection link.</p>
            <Link href="/">
              <Button className="mt-5">Create link</Button>
            </Link>
          </Card>
        )}

        {error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm font-semibold text-red-200">
            {error}
          </div>
        )}

        {links.map((link) => {
          const payPath = `/pay/${link.slug}`;
          const payUrl =
            typeof window === "undefined" ? payPath : `${window.location.origin}${payPath}`;
          const canCancel = link.status === "unpaid" || link.status === "processing";
          return (
            <Card key={link.id} className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-black">{link.amountUSDC} USDC</p>
                    <Pill className={statusTone(link.status)}>{link.status}</Pill>
                  </div>
                  <p className="mt-1 font-semibold text-white/60">{link.memo}</p>
                  <p className="mt-1 text-sm text-white/38">{shortAddress(link.recipientWallet)}</p>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:w-80">
                  <Button
                    variant="secondary"
                    onClick={() => copyLink(link.id, payUrl)}
                    aria-label="Copy pay link"
                  >
                    {copiedId === link.id ? (
                      <Check className="size-4 text-mint" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                  <Link href={payPath} aria-label="Open pay link">
                    <Button variant="secondary" className="w-full">
                      <ExternalLink className="size-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    disabled={!canCancel || cancellingId === link.id}
                    onClick={() => setConfirmTarget(link)}
                    aria-label="Cancel link"
                  >
                    {cancellingId === link.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <X className="size-4" />
                    )}
                  </Button>
                  <Link href={`/receipt/${link.id}`}>
                    <Button variant="secondary" className="w-full">
                      Receipt
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <ConfirmDialog
        open={confirmTarget !== null}
        title="Cancel this payment link?"
        body={
          confirmTarget
            ? `“${confirmTarget.memo}” for ${confirmTarget.amountUSDC} USDC will be cancelled on Arc. Anyone who tries to pay it after this will be blocked. This cannot be undone.`
            : ""
        }
        confirmLabel="Cancel link"
        cancelLabel="Keep it open"
        tone="danger"
        busy={cancellingId !== null}
        onConfirm={performCancel}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
