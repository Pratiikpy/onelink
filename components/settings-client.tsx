"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CheckCircle2, ExternalLink, ShieldCheck, XCircle } from "lucide-react";
import { Card, Pill } from "@/components/ui";
import {
  ARC_CHAIN_ID,
  ARC_EXPLORER_URL,
  ARC_FAUCET_URL,
  ARC_RPC_URL,
  ARC_USDC_ADDRESS,
} from "@/lib/arc";
import {
  ALLOW_DEMO_MODE,
  HAS_CONTRACT,
  ONELINK_CONTRACT_ADDRESS,
  PLATFORM_FEE_BPS,
} from "@/lib/contracts";

type Status = { label: string; ok: boolean; detail: string };

function envStatuses(): Status[] {
  const wc = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const publicDeploy = appUrl?.startsWith("https://") ?? false;

  return [
    {
      label: "OneLinkCollect contract",
      ok: HAS_CONTRACT || (!publicDeploy && ALLOW_DEMO_MODE),
      detail: HAS_CONTRACT
        ? "Configured — on-chain settlement enabled."
        : ALLOW_DEMO_MODE
          ? "Demo mode explicitly enabled. Do not use this setting for a production launch."
          : "Not set — deploy and set NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS before public launch.",
    },
    {
      label: "Supabase (cross-device links)",
      ok: !!(supabaseUrl && supabaseKey),
      detail:
        supabaseUrl && supabaseKey
          ? "Configured — links persist across devices."
          : "Not set — falling back to localStorage. Payers can't load links the creator made elsewhere.",
    },
    {
      label: "WalletConnect / Reown project ID",
      ok: !!(wc && wc !== "onelink-demo") || (!publicDeploy && ALLOW_DEMO_MODE),
      detail:
        wc && wc !== "onelink-demo"
          ? "Configured — mobile wallet QR connect available."
          : ALLOW_DEMO_MODE
            ? "Demo mode explicitly enabled. WalletConnect uses a placeholder project ID."
            : "Not set — mobile WalletConnect flow will fail. Get one (free) at cloud.reown.com.",
    },
    {
      label: "Public app URL",
      ok: !!(appUrl && !appUrl.includes("localhost")),
      detail:
        appUrl && !appUrl.includes("localhost")
          ? `Configured — ${appUrl}`
          : "Localhost only. Set NEXT_PUBLIC_APP_URL to the deployed domain for share/OG links.",
    },
  ];
}

export function SettingsClient() {
  const statuses = envStatuses();
  const allGreen = statuses.every((s) => s.ok);

  return (
    <div className="mx-auto max-w-[1120px] space-y-8 pb-8 xl:px-16">
      <div>
        <Pill className="font-mono uppercase tracking-[0.18em] text-lime">
          <ShieldCheck className="size-3.5" />
          Testnet configuration
        </Pill>
        <h1 className="mt-5 text-[64px] font-medium leading-none tracking-[-0.04em]">Launch settings</h1>
        <p className="mt-4 max-w-[680px] text-[24px] leading-[1.35] text-white/52">
          Verify production-critical values before sharing payment links publicly.
        </p>
      </div>

      <Card className="space-y-5 rounded-[30px] p-8">
        <div className="flex items-center justify-between gap-3">
          <p className="mono-label text-[13px]">
            Environment health
          </p>
          <Pill className={allGreen ? "text-lime" : "text-amber"}>
            {allGreen ? "Ready" : "Action needed"}
          </Pill>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {statuses.map((s) => (
            <div
              key={s.label}
              className="flex items-start gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] p-4"
            >
              {s.ok ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-lime" />
              ) : (
                <XCircle className="mt-0.5 size-5 shrink-0 text-amber" />
              )}
              <div>
                <p className="text-[18px] font-semibold text-white/85">{s.label}</p>
                <p className="mt-1 text-[14px] font-medium leading-5 text-white/50">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-[30px] p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="mono-label text-[13px]">Wallet</p>
            <p className="mt-2 text-[28px] font-medium">External wallets first</p>
          </div>
          <ConnectButton.Custom>
            {({ account, chain, mounted, openAccountModal, openConnectModal }) => {
              const connected = mounted && account && chain;
              return (
                <button
                  type="button"
                  onClick={connected ? openAccountModal : openConnectModal}
                  className="inline-flex h-12 items-center justify-center rounded-[18px] bg-lime px-6 text-[18px] font-medium text-ink"
                >
                  {connected ? "Wallet connected" : "Connect wallet"}
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </Card>

      <Card className="grid gap-3 rounded-[30px] p-8 md:grid-cols-2">
        {[
          ["Network", "Arc Testnet"],
          ["Chain ID", String(ARC_CHAIN_ID)],
          ["RPC", ARC_RPC_URL],
          ["USDC ERC-20", ARC_USDC_ADDRESS],
          ["Contract", HAS_CONTRACT ? ONELINK_CONTRACT_ADDRESS : "Not configured"],
          ["Platform fee", `${PLATFORM_FEE_BPS} bps`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
            <p className="mono-label text-[12px]">{label}</p>
            <p className="mt-2 break-all text-[17px] font-semibold text-white/82">{value}</p>
          </div>
        ))}
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href={ARC_FAUCET_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 font-semibold text-white transition hover:border-lime/50"
        >
          Circle faucet
          <ExternalLink className="mt-3 size-4 text-lime" />
        </a>
        <a
          href={ARC_EXPLORER_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 font-semibold text-white transition hover:border-lime/50"
        >
          Arcscan explorer
          <ExternalLink className="mt-3 size-4 text-lime" />
        </a>
      </div>
    </div>
  );
}
