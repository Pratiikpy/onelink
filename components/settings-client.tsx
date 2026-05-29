"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";

import { AppNav } from "@/components/onelink/nav";
import { Button } from "@/components/ui/button";
import { ARC_CHAIN_ID, ARC_RPC_URL, ARC_USDC_ADDRESS } from "@/lib/arc";
import { ALLOW_DEMO_MODE, HAS_CONTRACT, ONELINK_CONTRACT_ADDRESS } from "@/lib/contracts";
import { ENABLE_GATEWAY_ROUTE } from "@/lib/circle-payments";
import { friendlyError } from "@/lib/errors";
import {
  buildProfileClaimTypedData,
  getFreelancerProfile,
  normalizeHandle,
  PROFILE_CLAIM_TTL_SECONDS,
  PROFILE_STORAGE_KEY,
  saveFreelancerProfile,
  type FreelancerProfile,
  type ProfileClaim,
} from "@/lib/profiles";
import { truncateAddr } from "@/lib/format";
import { cn } from "@/lib/utils";

type Tab = "profile" | "wallet" | "network" | "danger";

// Shared (cross-device) storage is active when the public Supabase env vars are
// present — the same condition lib/profiles.ts uses to decide between the signed
// API claim and the local-only fallback.
const SHARED_STORAGE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function SettingsClient() {
  const { address, isConnected } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    // Try to read an existing profile by handle prefix derived from address (last 6 chars).
    const guess = normalizeHandle(`${address.slice(2, 8)}`);
    if (!guess) return;
    getFreelancerProfile(guess)
      .then((p) => {
        if (cancelled || !p) return;
        if (p.wallet.toLowerCase() !== address.toLowerCase()) return;
        setProfile(p);
        setHandle(p.handle);
        setDisplayName(p.displayName ?? "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [address]);

  async function saveProfile() {
    if (!address) return;
    const normalized = normalizeHandle(handle);
    if (!normalized) {
      toast.error("Handle is required (a-z, 0-9, dashes)");
      return;
    }
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const next: FreelancerProfile = {
        handle: normalized,
        displayName: displayName.trim() || normalized,
        wallet: address,
        createdAt: profile?.createdAt ?? now,
        updatedAt: now,
      };

      if (SHARED_STORAGE) {
        // Cross-device: prove wallet ownership with a time-boxed EIP-712 claim
        // before the server will persist the handle.
        const issuedAt = Math.floor(Date.now() / 1000);
        const claim: ProfileClaim = {
          handle: normalized,
          owner: address as `0x${string}`,
          issuedAt,
          expiresAt: issuedAt + PROFILE_CLAIM_TTL_SECONDS,
        };
        const signature = await signTypedDataAsync(buildProfileClaimTypedData(claim));
        await saveFreelancerProfile(next, signature, claim);
        setProfile(next);
        toast.success("Profile saved");
      } else {
        // Local-only demo mode: no signing required.
        await saveFreelancerProfile(next);
        setProfile(next);
        toast.success("Profile saved (local)");
      }
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background page-in">
      <AppNav />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Settings
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] md:text-[40px]">
          Account
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-[180px_1fr]">
          <nav className="-mx-6 flex flex-row gap-1 overflow-x-auto px-6 md:mx-0 md:flex-col md:overflow-visible md:px-0">
            {(
              [
                ["profile", "Profile"],
                ["wallet", "Wallet"],
                ["network", "Network"],
                ["danger", "Danger zone"],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={cn(
                  "relative shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm transition-colors",
                  tab === k ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab === k && (
                  <span className="absolute left-0 top-1/2 hidden h-4 w-[2px] -translate-y-1/2 rounded-full bg-foreground md:block" />
                )}
                {l}
              </button>
            ))}
          </nav>

          <div className="rounded-2xl border border-hairline bg-surface p-7">
            {tab === "profile" && (
              <div className="space-y-5">
                <Section
                  title="Profile"
                  desc="Your public freelancer handle at /<your-handle>."
                />
                {!isConnected ? (
                  <div className="rounded-md border border-hairline bg-background p-4 text-sm text-muted-foreground">
                    Connect a wallet to claim a handle.
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <Button
                          type="button"
                          size="sm"
                          onClick={openConnectModal}
                          className="mt-3"
                        >
                          Connect wallet
                        </Button>
                      )}
                    </ConnectButton.Custom>
                  </div>
                ) : (
                  <>
                    <FieldRow label="Display name" value={displayName} onChange={setDisplayName} />
                    <FieldRow
                      label="Handle"
                      value={handle}
                      onChange={(v) => setHandle(v.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      prefix="onelink.app/"
                      mono
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {SHARED_STORAGE
                        ? "Claiming a handle requires a one-time wallet signature to prove ownership. No gas, no funds moved."
                        : "Saved locally for this session. Connect shared storage for cross-device persistence."}
                    </p>
                    <div className="flex justify-end pt-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={saveProfile}
                        loading={busy}
                      >
                        {busy ? (SHARED_STORAGE ? "Signing…" : "Saving…") : "Save changes"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === "wallet" && (
              <div className="space-y-5">
                <Section
                  title="Connected wallet"
                  desc="Used for sign-in and as the default link recipient."
                />
                {!isConnected ? (
                  <ConnectButton />
                ) : (
                  <div className="flex items-center justify-between rounded-md border border-hairline bg-background p-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-8 w-8 rounded-full"
                        style={{
                          background:
                            "conic-gradient(from 200deg, oklch(0.16 0.004 260), oklch(0.42 0.06 158), oklch(0.16 0.004 260))",
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">Connected</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{address}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-hairline bg-surface px-3 py-1 text-xs">
                      {truncateAddr(address)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {tab === "network" && (
              <div className="space-y-5">
                <Section
                  title="Network"
                  desc="OneLink settles on Arc Testnet. Bridge route uses Circle CCTP from Base Sepolia."
                />
                <KV k="Chain" v="Arc Testnet" />
                <KV k="Chain ID" v={String(ARC_CHAIN_ID)} mono />
                <KV k="RPC" v={ARC_RPC_URL} mono />
                <KV k="USDC" v={ARC_USDC_ADDRESS} mono />
                <KV k="OneLinkCollect" v={ONELINK_CONTRACT_ADDRESS} mono />
                <KV
                  k="Has contract"
                  v={HAS_CONTRACT ? "Yes" : "No · demo mode"}
                />
                <KV
                  k="Allow demo in prod"
                  v={ALLOW_DEMO_MODE ? "Yes" : "No"}
                />
                <KV
                  k="Gateway route"
                  v={ENABLE_GATEWAY_ROUTE ? "Enabled" : "Gated · awaiting funded proof"}
                />
              </div>
            )}

            {tab === "danger" && (
              <div className="space-y-5">
                <Section title="Danger zone" desc="Irreversible actions. Be careful." />
                <DangerRow
                  title="Clear local demo data"
                  desc="Wipe local demo links and receipts from this browser only."
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("onelink:payment-links");
                      localStorage.removeItem(PROFILE_STORAGE_KEY);
                      toast.success("Local demo data cleared");
                    }
                  }}
                  cta="Clear"
                />
                <p className="text-xs text-muted-foreground">
                  Disconnect your wallet from your wallet app — OneLink does not store sessions.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border-b border-hairline pb-4">
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function FieldRow({
  label,
  value,
  onChange,
  prefix,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center rounded-md border border-hairline bg-background focus-within:border-foreground/40">
        {prefix && <span className="px-3 text-sm text-muted-foreground">{prefix}</span>}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full bg-transparent px-3 py-2.5 text-sm outline-none",
            mono && "font-mono text-xs",
          )}
        />
      </div>
    </div>
  );
}

function KV({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline pb-3 last:border-0">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className={cn("text-right text-sm", mono && "font-mono text-[11px] break-all")}>
        {v}
      </span>
    </div>
  );
}

function DangerRow({
  title,
  desc,
  cta,
  onClick,
}: {
  title: string;
  desc: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-destructive/20 bg-destructive/[0.04] p-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onClick}>
        {cta}
      </Button>
    </div>
  );
}
