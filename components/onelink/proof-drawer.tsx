"use client";

import { ExternalLink, ShieldCheck } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HashMono } from "./hash-mono";
import {
  ARC_CHAIN_ID,
  ARC_EXPLORER_URL,
  ARC_USDC_ADDRESS,
  isDemoTxHash,
} from "@/lib/arc";
import { ONELINK_CONTRACT_ADDRESS } from "@/lib/contracts";
import type { PaymentLink } from "@/lib/payments";

export function ProofDrawer({
  link,
  children,
}: {
  link: PaymentLink;
  children: React.ReactNode;
}) {
  const demo = isDemoTxHash(link.txHash);
  const verified = link.status === "paid" && !demo;

  const json = {
    chainId: ARC_CHAIN_ID,
    contract: ONELINK_CONTRACT_ADDRESS,
    token: ARC_USDC_ADDRESS,
    method:
      link.settlementMode === "profile"
        ? "payRecipient"
        : link.paymentMethod === "demo"
        ? "demo"
        : "payLink",
    linkId: link.contractLinkId,
    txHash: link.txHash ?? null,
    payer: link.payerWallet ?? null,
    recipient: link.recipientWallet,
    amountUsdc: Number(link.amountUSDC),
    paidAt: link.status === "paid" ? link.updatedAt : null,
    serverVerified: verified,
    source: link.sourceChain ?? "Arc_Testnet",
  };

  const arcscan =
    link.txHash && !demo ? `${ARC_EXPLORER_URL}/tx/${link.txHash}` : ARC_EXPLORER_URL;

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full max-w-md overflow-y-auto bg-background p-6 sm:max-w-lg">
        <SheetHeader className="space-y-1 p-0">
          <SheetTitle className="font-display text-xl font-semibold tracking-tight">
            Settlement proof
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {verified
              ? "Verified Arc Testnet receipt — read directly from the contract event log."
              : demo
              ? "Demo receipt — no on-chain settlement occurred."
              : "Awaiting verified on-chain settlement."}
          </SheetDescription>
        </SheetHeader>

        {verified ? (
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs text-success">
            <ShieldCheck className="h-3.5 w-3.5" /> Server-verified on-chain
          </div>
        ) : demo ? (
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-2.5 py-0.5 text-xs text-warning-foreground">
            Demo · no on-chain settlement
          </div>
        ) : (
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-hairline bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            Awaiting on-chain confirmation
          </div>
        )}

        <Tabs defaultValue="fields" className="mt-5">
          <TabsList className="grid w-full grid-cols-2 bg-muted/60">
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="json">Event JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="fields" className="mt-4 space-y-3">
            <Row label="Chain ID" value={String(ARC_CHAIN_ID)} mono />
            <Row label="Contract" value={ONELINK_CONTRACT_ADDRESS} mono copyable />
            <Row label="Token (USDC)" value={ARC_USDC_ADDRESS} mono copyable />
            <Row label="Method" value={String(json.method)} mono />
            <Row label="Link ID" value={link.contractLinkId} mono copyable />
            <Row label="Tx hash" value={link.txHash ?? "—"} mono copyable={!demo && !!link.txHash} />
            <Row label="Payer" value={link.payerWallet ?? "—"} mono copyable={!!link.payerWallet} />
            <Row label="Recipient" value={link.recipientWallet} mono copyable />
            <Row label="Amount" value={`${Number(link.amountUSDC).toLocaleString()} USDC`} />
            <Row label="Source chain" value={link.sourceChain ?? "Arc_Testnet"} />
            <Row label="Server verified" value={verified ? "Yes" : demo ? "Demo" : "Awaiting"} />
          </TabsContent>
          <TabsContent value="json" className="mt-4">
            <pre className="max-h-[60vh] overflow-auto rounded-md border border-hairline bg-muted/40 p-4 font-mono text-[11px] leading-relaxed">
              {JSON.stringify(json, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>

        {link.txHash && !demo && (
          <a
            href={arcscan}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border border-hairline bg-surface px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Open on Arcscan <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({
  label,
  value,
  mono,
  copyable,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-hairline pb-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      {mono ? (
        <HashMono
          value={value}
          display={value.length > 26 ? `${value.slice(0, 12)}…${value.slice(-8)}` : value}
          copyable={!!copyable}
          className="text-right"
        />
      ) : (
        <span className="text-right text-sm">{value}</span>
      )}
    </div>
  );
}
