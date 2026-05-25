"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { Card, Pill } from "@/components/ui";
import {
  ARC_CHAIN_ID,
  ARC_EXPLORER_URL,
  ARC_FAUCET_URL,
  ARC_RPC_URL,
  ARC_USDC_ADDRESS,
} from "@/lib/arc";
import { HAS_CONTRACT, ONELINK_CONTRACT_ADDRESS, PLATFORM_FEE_BPS } from "@/lib/contracts";

export function SettingsClient() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Pill>
          <ShieldCheck className="size-3.5" />
          Testnet configuration
        </Pill>
        <h1 className="mt-3 text-4xl font-black">Launch settings</h1>
        <p className="mt-2 text-white/52">Use these values when deploying and demoing OneLink.</p>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white/42">Wallet</p>
            <p className="mt-1 text-xl font-black">External wallets first</p>
          </div>
          <ConnectButton />
        </div>
      </Card>

      <Card className="space-y-3">
        {[
          ["Network", "Arc Testnet"],
          ["Chain ID", String(ARC_CHAIN_ID)],
          ["RPC", ARC_RPC_URL],
          ["USDC ERC-20", ARC_USDC_ADDRESS],
          ["Contract", HAS_CONTRACT ? ONELINK_CONTRACT_ADDRESS : "Not configured"],
          ["Platform fee", `${PLATFORM_FEE_BPS} bps`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">{label}</p>
            <p className="mt-1 break-all text-sm font-bold text-white/82">{value}</p>
          </div>
        ))}
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href={ARC_FAUCET_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 font-bold text-white transition hover:border-violet/50"
        >
          Circle faucet
          <ExternalLink className="mt-3 size-4 text-violet" />
        </a>
        <a
          href={ARC_EXPLORER_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 font-bold text-white transition hover:border-violet/50"
        >
          Arcscan explorer
          <ExternalLink className="mt-3 size-4 text-violet" />
        </a>
      </div>
    </div>
  );
}
