"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { MarketingNav, MarketingFooter } from "@/components/onelink/nav";
import { Reveal } from "@/components/onelink/reveal";
import { StatusBadge } from "@/components/onelink/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Real artifacts (per accuracy map) ────────────────────────────────────────
const VERIFIED_TX =
  "0x6b921b06d601e88cf1cdb0ea1eb5237cd89dc7220c0ef2ab6b910f46b312c4ab";
const VERIFIED_TX_SHORT = "0x6b92…c4ab";
const VERIFIED_TX_URL = `https://testnet.arcscan.app/tx/${VERIFIED_TX}`;
const RECIPIENT = "0x7a2f…91c4";
const APP_URL = "onelink-mauve-nu.vercel.app";
const SHARE_LINK = `${APP_URL}/pay/branding-q2`;

// ─────────────────────────────────────────────────────────────────────────────
// PhoneFrame — a self-contained premium CSS phone (bezel, notch, status bar).
// Renders any screen mock as `children` inside a true-to-life device shell.
// ─────────────────────────────────────────────────────────────────────────────
function PhoneFrame({
  children,
  className,
  statusTone = "ink",
}: {
  children: ReactNode;
  className?: string;
  /** Status-bar glyph tint — most screens use ink; the receipt uses success. */
  statusTone?: "ink" | "success";
}) {
  return (
    <div
      className={cn(
        "relative h-[620px] w-[300px] shrink-0 rounded-[2.6rem] border border-foreground/15 bg-foreground/[0.04] p-[10px] shadow-[0_28px_60px_-28px_rgba(0,0,0,0.35),0_2px_8px_-2px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      {/* Side buttons */}
      <span className="absolute -left-[2px] top-[120px] h-9 w-[3px] rounded-l bg-foreground/15" />
      <span className="absolute -left-[2px] top-[168px] h-9 w-[3px] rounded-l bg-foreground/15" />
      <span className="absolute -right-[2px] top-[140px] h-14 w-[3px] rounded-r bg-foreground/15" />

      {/* Screen */}
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-background">
        {/* Notch */}
        <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-foreground/90" />

        {/* Status bar */}
        <div
          className={cn(
            "relative z-10 flex h-11 shrink-0 items-end justify-between px-6 pb-1.5 text-[11px] font-semibold tabular-nums",
            statusTone === "success" ? "text-success" : "text-foreground",
          )}
        >
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            {/* signal */}
            <span className="flex items-end gap-[2px]">
              <span className="h-1.5 w-[3px] rounded-sm bg-current" />
              <span className="h-2 w-[3px] rounded-sm bg-current" />
              <span className="h-2.5 w-[3px] rounded-sm bg-current" />
              <span className="h-3 w-[3px] rounded-sm bg-current/40" />
            </span>
            {/* wifi */}
            <svg viewBox="0 0 16 12" className="h-3 w-3.5 fill-current">
              <path d="M8 11.5 1 4.5a9.9 9.9 0 0 1 14 0L8 11.5Z" opacity="0.9" />
            </svg>
            {/* battery */}
            <span className="flex items-center gap-[2px]">
              <span className="relative h-3 w-6 rounded-[3px] border border-current/70">
                <span className="absolute inset-[1.5px] right-1 rounded-[1px] bg-current" />
              </span>
              <span className="h-1.5 w-[2px] rounded-sm bg-current/70" />
            </span>
          </div>
        </div>

        {/* App content */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>

        {/* Home indicator */}
        <div className="flex h-6 shrink-0 items-center justify-center">
          <span className="h-1 w-28 rounded-full bg-foreground/25" />
        </div>
      </div>
    </div>
  );
}

/** Minimal in-phone top bar mirroring the real app header. */
function PhoneTopBar({ right }: { right?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
      <span className="font-display text-[13px] font-semibold tracking-[-0.02em]">
        OneLink
      </span>
      <span className="font-mono text-[10px] text-muted-foreground">
        {right ?? "Arc Testnet"}
      </span>
    </div>
  );
}

/** Conic recipient avatar matching the real pay-screen avatar. */
function Avatar({ char = "P", size = 40 }: { char?: string; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-display font-semibold text-background"
      style={{
        height: size,
        width: size,
        fontSize: size * 0.38,
        background:
          "conic-gradient(from 200deg, oklch(0.16 0.004 260), oklch(0.42 0.06 158), oklch(0.16 0.004 260))",
      }}
    >
      {char}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen mocks — real data, styled to match production pay/receipt/dashboard.
// ─────────────────────────────────────────────────────────────────────────────

/** 1 · Pay / Connect — $250.00 USDC, unpaid, to 0x7a2f…91c4. */
function ScreenPay() {
  return (
    <div className="flex h-full flex-col">
      <PhoneTopBar />
      <div className="flex-1 px-5 pt-5">
        <div className="mb-5 flex items-center gap-3">
          <Avatar char="7" />
          <div>
            <p className="text-[13px] font-medium">
              {RECIPIENT} <span className="text-muted-foreground">requested</span>
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">Arc Testnet</p>
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Amount due
            </span>
            <StatusBadge status="unpaid" />
          </div>
          <p className="mt-4 flex items-baseline gap-1.5 font-display text-[42px] font-semibold leading-none tracking-[-0.04em] tabular-nums">
            <span>$250.00</span>
            <span className="text-sm font-medium text-muted-foreground">USDC</span>
          </p>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Branding sprint — Q2 final
          </p>

          <div className="mt-4 space-y-1.5">
            <PreRow ok label="USDC is the gas token on Arc — no ETH" />
            <PreRow ok label="Receipt is server-verified before paid" />
          </div>

          <button
            type="button"
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-medium text-brand-foreground shadow-sm"
          >
            <Wallet className="h-4 w-4" /> Connect wallet to pay
          </button>
        </div>
      </div>
    </div>
  );
}

/** 2 · Create link — amount + memo fields, Create & share CTA. */
function ScreenCreate() {
  return (
    <div className="flex h-full flex-col">
      <PhoneTopBar right="New link" />
      <div className="flex-1 px-5 pt-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Create a request
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.02em]">
          Request USDC
        </h3>

        <div className="mt-5 space-y-4">
          <Field label="Amount">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-2xl font-semibold tabular-nums">
                250.00
              </span>
              <span className="text-xs font-medium text-muted-foreground">USDC</span>
            </div>
          </Field>
          <Field label="Memo">
            <span className="text-[13px] text-foreground">
              Branding sprint — Q2 final
            </span>
          </Field>
          <Field label="Expires">
            <span className="text-[13px] text-muted-foreground">In 7 days</span>
          </Field>
        </div>

        <button
          type="button"
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-medium text-brand-foreground shadow-sm"
        >
          Create &amp; share <ChevronRight className="h-4 w-4" />
        </button>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          One Arc transaction · settles on chain 5042002
        </p>
      </div>
    </div>
  );
}

/** 3 · Link is live — shareable URL + QR placeholder + Copy. */
function ScreenShare() {
  return (
    <div className="flex h-full flex-col">
      <PhoneTopBar />
      <div className="flex-1 px-5 pt-5">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-success text-success-foreground">
            <Check className="h-3.5 w-3.5" />
          </span>
          <p className="text-[13px] font-medium text-success">Link is live</p>
        </div>

        <div className="mt-4 rounded-2xl border border-hairline bg-surface p-5">
          {/* QR placeholder */}
          <div className="mx-auto grid h-36 w-36 place-items-center rounded-xl border border-hairline bg-background">
            <QrCode className="h-24 w-24 text-foreground/85" strokeWidth={1.25} />
          </div>

          <p className="mt-4 font-display text-2xl font-semibold tracking-[-0.03em] tabular-nums">
            $250.00 <span className="text-sm text-muted-foreground">USDC</span>
          </p>

          <div className="mt-4 rounded-lg border border-hairline bg-background px-3 py-2.5">
            <p className="break-all font-mono text-[11px] text-muted-foreground">
              {SHARE_LINK}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <span className="flex h-9 items-center justify-center rounded-xl border border-hairline bg-background text-xs font-medium">
              Copy link
            </span>
            <span className="flex h-9 items-center justify-center rounded-xl bg-foreground text-xs font-medium text-background">
              Share
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 4 · Verified receipt — Paid · verified on Arc, $250.00, real Arcscan tx. */
function ScreenReceipt() {
  return (
    <div className="flex h-full flex-col">
      <PhoneTopBar />
      <div className="flex-1 px-5 pt-5">
        <div className="rounded-2xl border border-hairline bg-surface p-5">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-success text-success-foreground">
              <Check className="h-3.5 w-3.5" />
            </span>
            <p className="text-[13px] font-medium text-success">
              Paid · verified on Arc
            </p>
          </div>

          <p className="mt-5 flex items-baseline gap-1.5 font-display text-[42px] font-semibold leading-none tracking-[-0.045em] tabular-nums">
            <span>$250.00</span>
            <span className="text-sm font-medium text-muted-foreground">USDC</span>
          </p>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Branding sprint — Q2 final
          </p>

          <div className="mt-5 space-y-2 border-t border-hairline pt-4 text-[12px]">
            <KV k="To" v={RECIPIENT} mono />
            <KV k="Method" v="Arc-direct" />
            <KV k="Source" v="ARC_TESTNET" mono />
            <KV
              k="Tx hash"
              v={
                <a
                  href={VERIFIED_TX_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-brand-text underline-offset-2 hover:underline"
                >
                  {VERIFIED_TX_SHORT}
                </a>
              }
            />
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-md border border-success/20 bg-success/[0.06] p-2.5 text-[11px] text-success">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>Server-verified against PaymentCompleted</span>
          </div>

          <a
            href={VERIFIED_TX_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-hairline bg-background text-xs font-medium"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View on Arcscan
          </a>
        </div>
      </div>
    </div>
  );
}

/** 5 · Dashboard — a couple of link rows with StatusBadge. */
function ScreenDashboard() {
  const rows: {
    memo: string;
    amount: string;
    status: "paid" | "unpaid" | "processing";
    when: string;
  }[] = [
    { memo: "Branding sprint — Q2 final", amount: "250.00", status: "paid", when: "2h ago" },
    { memo: "Logo revision round 3", amount: "120.00", status: "unpaid", when: "Today" },
    { memo: "Retainer — June", amount: "800.00", status: "processing", when: "5m ago" },
  ];
  return (
    <div className="flex h-full flex-col">
      <PhoneTopBar right="Overview" />
      <div className="flex-1 px-5 pt-5">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">
            Your links
          </h3>
          <span className="font-mono text-[10px] text-muted-foreground">3 active</span>
        </div>

        <div className="mt-2 rounded-xl border border-hairline bg-surface p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Collected
          </p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] tabular-nums">
            $250.00 <span className="text-xs text-muted-foreground">USDC</span>
          </p>
        </div>

        <div className="mt-3 space-y-2">
          {rows.map((r) => (
            <div
              key={r.memo}
              className="rounded-xl border border-hairline bg-surface px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[12px] font-medium">{r.memo}</p>
                <StatusBadge status={r.status} />
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="font-display text-sm font-semibold tabular-nums">
                  ${r.amount}{" "}
                  <span className="text-[10px] font-medium text-muted-foreground">
                    USDC
                  </span>
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {r.when}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Small shared in-phone primitives ─────────────────────────────────────────
function PreRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-hairline bg-background px-2.5 py-1.5 text-[11px]">
      <span className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-success" : "bg-warning")} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface px-3.5 py-2.5">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function KV({ k, v, mono }: { k: string; v: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("text-right text-foreground", mono && "font-mono text-[11px]")}>
        {v}
      </span>
    </div>
  );
}

// ── Gallery data ─────────────────────────────────────────────────────────────
type Persona = "creator" | "payer";

const SCREENS: {
  key: string;
  caption: string;
  title: string;
  persona: Persona;
  render: () => ReactNode;
  tone?: "ink" | "success";
}[] = [
  { key: "pay", caption: "Connect", title: "Pay / Connect", persona: "payer", render: () => <ScreenPay /> },
  { key: "create", caption: "Create", title: "Create link", persona: "creator", render: () => <ScreenCreate /> },
  { key: "share", caption: "Share", title: "Link is live", persona: "creator", render: () => <ScreenShare /> },
  { key: "receipt", caption: "Receipt", title: "Verified receipt", persona: "payer", render: () => <ScreenReceipt />, tone: "success" },
  { key: "dashboard", caption: "Overview", title: "Dashboard", persona: "creator", render: () => <ScreenDashboard /> },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function MobileShowcase() {
  const [persona, setPersona] = useState<"all" | Persona>("all");
  const visible =
    persona === "all" ? SCREENS : SCREENS.filter((s) => s.persona === persona);

  return (
    <div className="min-h-screen bg-background page-in">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-16 md:pt-28 md:pb-20">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Mobile · the whole product
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-6xl">
              The whole product, in your{" "}
              <span className="text-brand">thumb.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
              Tap through both sides of a payment — the creator who requests USDC and
              the payer who settles it — every screen end to end, settled on Arc Testnet.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild variant="brand" size="lg">
                <Link href="/create">
                  Create a link <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/how-it-works">See how it works</Link>
              </Button>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
                Testnet · chain 5042002
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Every screen, end to end
                </p>
                <h2 className="mt-3 max-w-xl text-balance font-display text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                  Connect, create, share, settle, verify.
                </h2>
              </div>

              {/* Creator / Payer segmented toggle */}
              <div
                role="group"
                aria-label="Filter screens by persona"
                className="inline-flex w-fit items-center gap-1 rounded-full border border-hairline bg-surface p-1 text-[13px]"
              >
                {(
                  [
                    ["all", "Both"],
                    ["creator", "Creator"],
                    ["payer", "Payer"],
                  ] as const
                ).map(([key, label]) => {
                  const active = persona === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setPersona(key)}
                      className={cn(
                        "rounded-full px-4 py-1.5 font-medium transition-colors",
                        active
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Horizontal scroll-snap row with edge fade */}
          <div className="relative mt-12">
            <div
              className="-mx-6 flex snap-x snap-mandatory gap-7 overflow-x-auto px-6 pb-6 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
              }}
            >
              {visible.map((s, i) => (
                <Reveal
                  key={s.key}
                  delay={i * 80}
                  className="snap-center"
                >
                  <figure className="flex flex-col items-center">
                    <PhoneFrame statusTone={s.tone}>{s.render()}</PhoneFrame>
                    <figcaption className="mt-5 text-center">
                      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand-text">
                        {s.caption}
                      </p>
                      <p className="mt-1 text-sm font-medium tracking-tight">
                        {s.title}
                      </p>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={120}>
            <p className="mt-6 text-center text-[12px] text-muted-foreground">
              Scroll the row · every amount, address and hash above is real. The receipt
              hash links a verified Arc Testnet settlement.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Proof strip */}
      <section className="border-t border-hairline py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  k: "Settlement before status",
                  v: "A link only reads paid after the server matches the on-chain PaymentCompleted event — never the browser.",
                },
                {
                  k: "USDC is the gas",
                  v: "Payers settle on Arc Testnet with no ETH. Fee is capped on-chain at ≤1%, enforced by the contract.",
                },
                {
                  k: "Every claim has a hash",
                  v: "Each receipt links the exact Arcscan transaction so anyone can re-check the proof for themselves.",
                },
              ].map((c, i) => (
                <Reveal
                  key={c.k}
                  delay={i * 80}
                  className="rounded-2xl border border-hairline bg-surface p-6"
                >
                  <p className="font-display text-base font-semibold tracking-[-0.01em]">
                    {c.k}
                  </p>
                  <p className="mt-2 text-pretty text-sm text-muted-foreground">
                    {c.v}
                  </p>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-hairline bg-surface px-6 py-10 text-center card-lift">
              <h3 className="max-w-lg text-balance font-display text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
                Try the real thing on your phone.
              </h3>
              <p className="max-w-md text-pretty text-sm text-muted-foreground">
                These are styled mocks. The live app runs the exact flow — create a link,
                share it, and settle on Arc.
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                <Button asChild variant="brand" size="lg">
                  <Link href="/create">
                    Create a link <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a
                    href={VERIFIED_TX_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Verify a receipt <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
