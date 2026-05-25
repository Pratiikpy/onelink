"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Copy, ExternalLink, RefreshCw } from "lucide-react";
import { Button, Card, Pill } from "@/components/ui";
import { listPaymentLinks } from "@/lib/storage";
import type { PaymentLink } from "@/lib/payments";
import { shortAddress, statusTone } from "@/lib/payments";

export function DashboardClient() {
  const { address } = useAccount();
  const [links, setLinks] = useState<PaymentLink[]>([]);

  const refresh = useCallback(async () => {
    setLinks(await listPaymentLinks(address));
  }, [address]);

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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Pill>Receiver dashboard</Pill>
          <h1 className="mt-3 text-4xl font-black text-white">Your collection links</h1>
          <p className="mt-2 text-white/52">Simple status tracking from local cache/Supabase.</p>
        </div>
        <Button variant="secondary" onClick={refresh}>
          <RefreshCw className="size-4" />
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

        {links.map((link) => {
          const payPath = `/pay/${link.slug}`;
          const payUrl = typeof window === "undefined" ? payPath : `${window.location.origin}${payPath}`;
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
                <div className="grid grid-cols-3 gap-2 sm:w-64">
                  <Button variant="secondary" onClick={() => navigator.clipboard.writeText(payUrl)}>
                    <Copy className="size-4" />
                  </Button>
                  <Link href={payPath}>
                    <Button variant="secondary" className="w-full">
                      <ExternalLink className="size-4" />
                    </Button>
                  </Link>
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
    </div>
  );
}
