"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  Layers,
  Link2,
  Lock,
  Minus,
  Receipt,
  Send,
  ServerCog,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { MarketingNav, MarketingFooter } from "@/components/onelink/nav";
import { Reveal } from "@/components/onelink/reveal";
import { CountUp } from "@/components/onelink/count-up";
import { ARC_CHAIN_ID, explorerTx } from "@/lib/arc";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Real, provable artifacts (see .v2-spec accuracy map). Every claim below
 * maps to one of these. No fabricated metrics, no mainnet/Solana claims.
 * ------------------------------------------------------------------------ */

const APP_URL = "https://onelink-mauve-nu.vercel.app";
const CONTRACT = "0x9b7D5B4DAD4c9B1065908FA8C6C34d697E3cBD0c";
const SAMPLE_RECEIPT = "/receipt/7e41bf18-b61c-4af2-baeb-b10f219d58e8";

const TX = {
  direct: "0x508ebf9ac99613534e82d768d423c0d30c274c57d30f0181c9cba6805e5ddd46",
  cancel: "0x9a7d08580a5313cb97220c21e2011d6f042cc0c6db0349d75a4cafc46bdc5138",
  profile: "0xe6521e60bd25a01a82124ec22a368c9200480081b2708ffadcce23779aed0fea",
  walletconnect:
    "0x2f5abeb1840cd6ed905cb3af6d72e7de7c6ad44c84a30050a79605eceea48daa",
  browser: "0x031e671e9321e60310276af91a1bb3b52c8079be86a824bc0378edd98a67a889",
  bridge: "0x06907a47b9c79da2164efcd5fe9f58fe708969fee27af4563c3b232c860911ad",
} as const;

function shortHash(h: string) {
  return `${h.slice(0, 8)}…${h.slice(-6)}`;
}

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-background page-in">
      <MarketingNav />

      <main>
        <Hero />
        <Problem />
        <Solution />
        <Differentiators />
        <HowItWorks />
        <Routes />
        <Proof />
        <Scope />
        <Model />
        <Roadmap />
        <Closing />
      </main>

      <MarketingFooter />
    </div>
  );
}

/* ============================== HERO ============================== */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-hairline">
      <div
        className="pointer-events-none absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/[0.07] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            Live · deployed · verified on-chain
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mt-7 max-w-4xl text-balance font-display text-[44px] font-semibold leading-[1.04] tracking-[-0.04em] md:text-[76px]">
            One link for USDC.{" "}
            <span className="text-brand">It ends in proof.</span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Freelancers lose hours to the same back-and-forth — which wallet,
            which network, which address format, which kind of USDC. OneLink is
            one page that settles on Arc, and only shows{" "}
            <span className="font-medium text-foreground">paid</span> after the
            server verifies the on-chain event. No screenshots. No trust me.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild variant="brand" size="lg">
              <Link href="/create">
                <Send className="h-4 w-4" />
                Create a payment link
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/how-it-works">
                See how it works
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href={explorerTx(TX.direct)} target="_blank" rel="noreferrer">
                View a live settlement
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={320}>
          <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-4">
            <HeroStat k="Settles on" v="Arc" sub={`chain ${ARC_CHAIN_ID}`} />
            <HeroStat k="Native gas" v="USDC" sub="no second token" />
            <HeroStat k="Status source" v="On-chain" sub="server-verified" />
            <HeroStat k="Fee" v="≤1%" sub="capped on-chain" />
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

function HeroStat({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div className="bg-background p-5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {k}
      </dt>
      <dd className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em]">
        {v}
      </dd>
      <dd className="mt-1 text-[12px] text-muted-foreground">{sub}</dd>
    </div>
  );
}

/* ============================== 01 PROBLEM ============================== */

function Problem() {
  const cards = [
    {
      icon: <Layers className="h-4 w-4" />,
      title: "Too many ways to get it wrong",
      body: "Wallets, networks, address formats, and USDC variants turn one invoice into a back-and-forth. Send on the wrong chain and the money is gone.",
    },
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      title: "Clients want reassurance",
      body: "Payers hesitate without a clear, trustworthy page. Freelancers fill the gap with ad-hoc support and screenshots — every single time.",
    },
    {
      icon: <Receipt className="h-4 w-4" />,
      title: "A screenshot isn't proof",
      body: "A raw explorer link or a cropped screenshot isn't a professional checkout, and it doesn't actually prove the money arrived where it should.",
    },
  ];
  return (
    <Section eyebrow="01 · The problem" title="Getting paid in USDC is still a support thread.">
      <SectionLead>
        The asset is global and programmable. The experience around it is
        anything but — and freelancers absorb the friction on every invoice.
      </SectionLead>
      <div className="mt-12 grid gap-3 md:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 80}>
            <Card>
              <IconChip>{c.icon}</IconChip>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
                {c.title}
              </h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                {c.body}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ============================== 02 SOLUTION ============================== */

function Solution() {
  const steps = [
    { k: "Create", v: "Set amount, memo, expiry." },
    { k: "Open & connect", v: "Payer opens one page, connects a wallet." },
    { k: "Pay a supported route", v: "Direct on Arc, or bridge from Base." },
    { k: "Verify on Arc", v: "Server confirms the on-chain event." },
    { k: "Verifiable receipt", v: "Anchored to Arcscan, re-checkable." },
  ];
  return (
    <Section eyebrow="02 · The solution" title="Settlement before status.">
      <SectionLead>
        OneLink is one professional page that replaces the chain confusion. The
        UI only flips to{" "}
        <span className="font-medium text-foreground">paid</span> after the
        server verifies the settlement event on Arc — never on the browser&rsquo;s
        word. The contract is the source of truth.
      </SectionLead>

      <Reveal delay={120}>
        <div className="mt-12 rounded-2xl border border-hairline bg-surface p-3 md:p-4">
          <ol className="grid gap-2 md:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.k} className="relative">
                <div className="h-full rounded-xl bg-background p-4">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-brand-tint font-mono text-[11px] font-medium tabular-nums text-brand-text">
                      {i + 1}
                    </span>
                    <p className="font-display text-sm font-semibold tracking-tight">
                      {s.k}
                    </p>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {s.v}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight
                    className="absolute -right-[11px] top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground/40 md:block"
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </Section>
  );
}

/* ============================== 03 DIFFERENTIATORS ============================== */

function Differentiators() {
  const items = [
    {
      icon: <Layers className="h-4 w-4" />,
      title: "Pay however you hold USDC",
      body: "Direct on Arc, or bridge from Base via Circle CCTP. Whatever route the payer picks, the money always lands on Arc.",
    },
    {
      icon: <Zap className="h-4 w-4" />,
      title: "USDC is the only token you need",
      body: "USDC is Arc's native gas. No ETH-for-gas dance, no second balance — the payer signs once and it settles.",
    },
    {
      icon: <ServerCog className="h-4 w-4" />,
      title: "Server-verified, not browser trust",
      body: "The browser can ask, but it cannot mark anything paid. Only a verified Arc event flips terminal state.",
    },
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      title: "Every claim has a hash",
      body: "Each receipt anchors to a real Arcscan transaction you can open and re-check yourself. Nothing to take on faith.",
    },
  ];
  return (
    <Section eyebrow="03 · Differentiators" title="What makes it different.">
      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 70}>
            <Card className="flex gap-4">
              <IconChip>{it.icon}</IconChip>
              <div>
                <h3 className="font-display text-base font-semibold tracking-tight">
                  {it.title}
                </h3>
                <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {it.body}
                </p>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ============================== 04 HOW IT WORKS ============================== */

function HowItWorks() {
  const steps = [
    {
      icon: <Link2 className="h-4 w-4" />,
      k: "Create",
      v: "Creator sets the amount and memo. The contract emits a PaymentLinkCreated event the app verifies before the link goes live.",
      tag: "PaymentLinkCreated",
    },
    {
      icon: <Send className="h-4 w-4" />,
      k: "Share",
      v: "One shareable URL — a clean checkout, not a raw address. Works as a one-time invoice or a permanent profile page.",
      tag: "One link",
    },
    {
      icon: <Layers className="h-4 w-4" />,
      k: "Pay",
      v: "Pay directly on Arc, or bridge from Base Sepolia via CCTP. USDC pays the network fee — no separate gas token.",
      tag: "Arc · or CCTP from Base",
    },
    {
      icon: <ServerCog className="h-4 w-4" />,
      k: "Verify",
      v: "The server watches for the PaymentCompleted event on Arc and confirms it before any status changes to paid.",
      tag: "PaymentCompleted",
    },
    {
      icon: <Receipt className="h-4 w-4" />,
      k: "Receipt",
      v: "A verifiable receipt with the Arcscan transaction and a server-verified flag — proof the payer and the creator both keep.",
      tag: "Arcscan + server-verified",
    },
  ];
  return (
    <Section eyebrow="04 · How it works" title="Five steps, each anchored to an event.">
      <SectionLead>
        Nothing flips to a positive state on a hunch. Each step maps to a real
        contract event, and the receipt links back to the chain.
      </SectionLead>
      <ol className="mt-12 space-y-3">
        {steps.map((s, i) => (
          <Reveal key={s.k} delay={i * 60}>
            <li className="flex flex-col gap-4 rounded-2xl border border-hairline bg-surface p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4 sm:w-56 sm:shrink-0">
                <span className="font-mono text-sm tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-foreground text-background">
                  {s.icon}
                </span>
                <span className="font-display text-lg font-semibold tracking-tight">
                  {s.k}
                </span>
              </div>
              <p className="flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                {s.v}
              </p>
              <span className="inline-flex shrink-0 items-center self-start rounded-full border border-hairline bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:self-auto">
                {s.tag}
              </span>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

/* ============================== 05 ROUTES ============================== */

function Routes() {
  const rows = [
    {
      route: "Arc-direct",
      detail: "Pay USDC straight to the contract on Arc.",
      status: "Live-proven",
      tone: "live" as const,
    },
    {
      route: "Bridge via CCTP",
      detail: "Base Sepolia → Arc through Circle App Kit. Always lands on Arc.",
      status: "Live-proven",
      tone: "live" as const,
    },
    {
      route: "Unified balance · Gateway",
      detail: "Circle Gateway crosschain balance — implemented, not yet enabled.",
      status: "Gated",
      tone: "gated" as const,
    },
  ];
  return (
    <Section eyebrow="05 · Supported routes" title="Three routes. Two proven live today.">
      <SectionLead>
        However the payer holds USDC, the destination is the same. Base Sepolia
        is the proven bridge source; other testnet sources are in beta. Gateway
        is built but gated.
      </SectionLead>
      <Reveal delay={120}>
        <div className="mt-12 overflow-hidden rounded-2xl border border-hairline bg-surface">
          <div className="hidden grid-cols-[1.2fr_1.8fr_auto] gap-4 border-b border-hairline px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:grid">
            <span>Route</span>
            <span>What it does</span>
            <span className="text-right">Status</span>
          </div>
          {rows.map((r) => (
            <div
              key={r.route}
              className="grid gap-2 border-b border-hairline px-6 py-5 last:border-b-0 sm:grid-cols-[1.2fr_1.8fr_auto] sm:items-center sm:gap-4"
            >
              <p className="font-display text-base font-semibold tracking-tight">
                {r.route}
              </p>
              <p className="text-sm text-muted-foreground">{r.detail}</p>
              <div className="sm:text-right">
                <StatusPill tone={r.tone}>{r.status}</StatusPill>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* ============================== 06 PROOF ============================== */

function Proof() {
  const stats = [
    { value: 27, suffix: "/27", label: "Foundry contract tests" },
    { value: 0, suffix: "", label: "Open security alerts" },
    { value: 5, suffix: "", label: "Viewports QA'd" },
    { value: 1, prefix: "≤", suffix: "%", label: "Fee, capped on-chain" },
  ];
  const txs = [
    { label: "Direct Arc payment", hash: TX.direct },
    { label: "Verified cancellation", hash: TX.cancel },
    { label: "Permanent profile payment", hash: TX.profile },
    { label: "WalletConnect signed payment", hash: TX.walletconnect },
    { label: "Browser-wallet end-to-end", hash: TX.browser },
    { label: "Base → Arc bridge settlement", hash: TX.bridge },
  ];
  return (
    <section className="border-y border-hairline bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            06 · Proof
          </p>
          <h2 className="mt-5 max-w-3xl text-balance font-display text-3xl font-semibold tracking-[-0.03em] md:text-[44px] md:leading-[1.08]">
            A working product — not a mockup.
          </h2>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Public deployment, public test artifacts, public on-chain
            settlement. Every figure links to something you can re-check.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-background p-6">
                <dd className="font-display text-[44px] font-semibold leading-none tracking-[-0.04em] tabular-nums md:text-[52px]">
                  <CountUp
                    value={s.value}
                    prefix={s.prefix ?? ""}
                    suffix={s.suffix ?? ""}
                  />
                </dd>
                <dt className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-6 rounded-2xl border border-hairline bg-surface p-6">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Real on-chain transactions
              </p>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-success">
                <ShieldCheck className="h-3.5 w-3.5" /> Arcscan
              </span>
            </div>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {txs.map((t) => (
                <li key={t.hash}>
                  <a
                    href={explorerTx(t.hash)}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-xl border border-hairline bg-background px-4 py-3 transition-colors hover:border-brand/40 hover:bg-brand-tint/40"
                  >
                    <span className="text-sm text-foreground/85">{t.label}</span>
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors group-hover:text-brand-text">
                      {shortHash(t.hash)}
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="font-mono">
                Contract {shortHash(CONTRACT)}
              </span>
              <span className="text-muted-foreground/40">·</span>
              <Link href={SAMPLE_RECEIPT} className="underline-offset-2 hover:underline">
                Sample receipt
              </Link>
              <span className="text-muted-foreground/40">·</span>
              <Link href="/security" className="underline-offset-2 hover:underline">
                Full QA bundle
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================== 07 VERIFIED SCOPE ============================== */

function Scope() {
  const live = [
    "Arc Testnet · USDC-native settlement",
    "Base Sepolia → Arc via Circle CCTP",
    "Profile, invoice & receipt surfaces",
    "Server-verified terminal state",
    "27/27 Foundry tests · 0 open alerts",
  ];
  const gated = ["Circle Gateway unified balance (built, awaiting enablement)"];
  const beta = ["Ethereum Sepolia · Arbitrum Sepolia · Polygon Amoy bridge sources"];
  const notClaimed = ["Mainnet", "Any-chain / arbitrary wallet", "Solana", "Fiat / cards"];

  return (
    <Section eyebrow="07 · Verified scope" title="What we claim — and what we don't.">
      <SectionLead>
        Same truth in the live product, the README, and this deck. We don&rsquo;t
        ship what we can&rsquo;t prove.
      </SectionLead>

      <div className="mt-12 grid gap-3 md:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-2xl border border-success/15 bg-success/[0.04] p-6">
            <ScopeHead
              icon={<Check className="h-4 w-4" />}
              tone="live"
              label="Live & proven"
            />
            <ul className="mt-5 space-y-2.5">
              {live.map((l) => (
                <ScopeLine key={l} status="ok" label={l} />
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={90}>
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-hairline bg-surface p-6">
              <ScopeHead
                icon={<Lock className="h-4 w-4" />}
                tone="gated"
                label="Gated / beta"
              />
              <ul className="mt-5 space-y-2.5">
                {gated.map((l) => (
                  <ScopeLine key={l} status="gated" label={l} />
                ))}
                {beta.map((l) => (
                  <ScopeLine key={l} status="beta" label={l} />
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-hairline bg-muted/40 p-6">
              <ScopeHead
                icon={<X className="h-4 w-4" />}
                tone="off"
                label="Not claimed"
              />
              <ul className="mt-5 space-y-2.5">
                {notClaimed.map((l) => (
                  <ScopeLine key={l} status="off" label={l} />
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={160}>
        <p className="mt-6 rounded-xl border border-hairline bg-surface px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          To be explicit: we do{" "}
          <span className="font-medium text-foreground">not</span> claim
          mainnet, any-chain or arbitrary-wallet support, and Circle Gateway is{" "}
          <span className="font-medium text-foreground">not</span> proven live —
          it&rsquo;s implemented but gated. Everything is on Arc Testnet.
        </p>
      </Reveal>
    </Section>
  );
}

/* ============================== 08 MODEL & MARKET ============================== */

function Model() {
  return (
    <Section eyebrow="08 · Model & market" title="Capped fee, non-custodial, freelancer-first.">
      <div className="mt-12 grid gap-3 md:grid-cols-2">
        <Reveal>
          <Card>
            <IconChip>
              <ShieldCheck className="h-4 w-4" />
            </IconChip>
            <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
              The model
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <ModelLine
                k="≤1% fee"
                v="Capped on-chain. The contract enforces the ceiling — not a dashboard setting."
              />
              <ModelLine
                k="Non-custodial"
                v="Funds move wallet-to-contract. OneLink never holds the payer's USDC."
              />
              <ModelLine
                k="Verifiable"
                v="Every payment resolves to an Arcscan transaction and a server-verified flag."
              />
            </ul>
          </Card>
        </Reveal>
        <Reveal delay={90}>
          <Card>
            <IconChip>
              <Sparkles className="h-4 w-4" />
            </IconChip>
            <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
              The market
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <ModelLine
                k="Wedge"
                v="Web3-native freelancers already paid in USDC, tired of route fragmentation and screenshot proofs."
              />
              <ModelLine
                k="Expansion"
                v="Designers, devs and consultants invoicing across borders; creators with a tip-jar-plus-invoice link."
              />
              <ModelLine
                k="Then"
                v="Small agencies running per-project invoices with verifiable on-chain receipts."
              />
            </ul>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}

/* ============================== 09 ROADMAP ============================== */

function Roadmap() {
  const points = [
    {
      when: "Now",
      title: "Gateway enablement",
      body: "Unblock the Circle Gateway unified-balance flow that's already implemented behind the gate.",
      state: "active" as const,
    },
    {
      when: "Next",
      title: "More bridge sources",
      body: "Promote Ethereum Sepolia, Arbitrum Sepolia and Polygon Amoy from beta to proven CCTP routes.",
      state: "upcoming" as const,
    },
    {
      when: "Later",
      title: "Mainnet pilot",
      body: "Closed-cohort rollout once Gateway proof and a final security review land.",
      state: "upcoming" as const,
    },
    {
      when: "Future",
      title: "Solana",
      body: "Extend the same verify-before-status model beyond EVM. Future-tense — not claimed today.",
      state: "future" as const,
    },
  ];
  return (
    <Section eyebrow="09 · Roadmap" title="Unblock the rails we already built.">
      <SectionLead>
        The work after this is enabling what&rsquo;s implemented — not adding new
        theatre. Each step is sequenced, not promised.
      </SectionLead>
      <div className="relative mt-14">
        <div
          className="absolute left-0 right-0 top-[18px] hidden h-px bg-hairline md:block"
          aria-hidden
        />
        <div className="relative grid gap-8 md:grid-cols-4">
          {points.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <TimelinePoint {...p} />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ============================== CLOSING ============================== */

function Closing() {
  return (
    <section className="border-t border-hairline">
      <div className="relative mx-auto max-w-6xl overflow-hidden px-6 py-24 text-center md:py-32">
        <div
          className="pointer-events-none absolute inset-0 dot-bg [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
          aria-hidden
        />
        <Reveal>
          <h2 className="relative mx-auto max-w-3xl text-balance font-display text-4xl font-semibold tracking-[-0.035em] md:text-[60px] md:leading-[1.05]">
            See it settle. Then re-check the hash.
          </h2>
          <p className="relative mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            The fastest way to understand OneLink is to create a link, pay it,
            and watch the receipt anchor to Arcscan.
          </p>
          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="brand" size="lg">
              <Link href="/create">
                <Send className="h-4 w-4" />
                See the product
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/whitepaper">
                <FileText className="h-4 w-4" />
                Read the whitepaper
              </Link>
            </Button>
          </div>
          <div className="relative mt-8 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-hairline bg-surface px-4 py-1.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            <span className="font-mono">{APP_URL.replace("https://", "")}</span>
            <span className="text-muted-foreground/40">·</span>
            <span>Arc Testnet · chain {ARC_CHAIN_ID}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================== shared atoms ============================== */

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </p>
          <h2 className="mt-5 max-w-3xl text-balance font-display text-3xl font-semibold tracking-[-0.03em] md:text-[44px] md:leading-[1.08]">
            {title}
          </h2>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

function SectionLead({ children }: { children: React.ReactNode }) {
  return (
    <Reveal delay={80}>
      <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
        {children}
      </p>
    </Reveal>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-full rounded-2xl border border-hairline bg-surface p-6 transition-shadow duration-200 hover:card-lift",
        className,
      )}
    >
      {children}
    </div>
  );
}

function IconChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-tint text-brand-text">
      {children}
    </span>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: "live" | "gated";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
        tone === "live"
          ? "border-success/20 bg-success/[0.08] text-success"
          : "border-hairline bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "live" ? "bg-success animate-pulse-dot" : "bg-muted-foreground/50",
        )}
      />
      {children}
    </span>
  );
}

function ScopeHead({
  icon,
  tone,
  label,
}: {
  icon: React.ReactNode;
  tone: "live" | "gated" | "off";
  label: string;
}) {
  const styles =
    tone === "live"
      ? "bg-success text-success-foreground"
      : tone === "gated"
        ? "bg-brand-tint text-brand-text"
        : "bg-muted text-muted-foreground";
  const text =
    tone === "live"
      ? "text-success"
      : tone === "gated"
        ? "text-foreground"
        : "text-muted-foreground";
  return (
    <div className="flex items-center gap-2">
      <span className={cn("grid h-7 w-7 place-items-center rounded-md", styles)}>
        {icon}
      </span>
      <p className={cn("font-display text-base font-semibold tracking-tight", text)}>
        {label}
      </p>
    </div>
  );
}

function ScopeLine({
  status,
  label,
}: {
  status: "ok" | "gated" | "beta" | "off";
  label: string;
}) {
  const meta = {
    ok: {
      icon: <Check className="h-3.5 w-3.5 text-success" />,
      tone: "text-foreground",
    },
    gated: {
      icon: <Lock className="h-3.5 w-3.5 text-brand" />,
      tone: "text-foreground/80",
    },
    beta: {
      icon: <Minus className="h-3.5 w-3.5 text-brand" />,
      tone: "text-foreground/80",
    },
    off: {
      icon: <X className="h-3.5 w-3.5 text-muted-foreground/60" />,
      tone: "text-muted-foreground line-through decoration-muted-foreground/30",
    },
  }[status];
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center">
        {meta.icon}
      </span>
      <span className={meta.tone}>{label}</span>
    </li>
  );
}

function ModelLine({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex flex-col gap-0.5 border-t border-hairline pt-3 first:border-t-0 first:pt-0">
      <span className="font-medium text-foreground">{k}</span>
      <span className="text-muted-foreground">{v}</span>
    </li>
  );
}

function TimelinePoint({
  when,
  title,
  body,
  state,
}: {
  when: string;
  title: string;
  body: string;
  state: "active" | "upcoming" | "future";
}) {
  const dotCls =
    state === "active"
      ? "bg-brand border-brand"
      : state === "upcoming"
        ? "bg-background border-brand/40"
        : "bg-background border-hairline";
  const pillCls =
    state === "active"
      ? "border-transparent bg-brand text-brand-foreground"
      : "border-hairline bg-surface text-muted-foreground";
  return (
    <div className="flex flex-col items-center text-center">
      <span
        className={cn(
          "relative z-10 grid h-9 w-9 place-items-center rounded-full border-2",
          dotCls,
        )}
      >
        {state === "active" && (
          <span className="h-1.5 w-1.5 rounded-full bg-brand-foreground" />
        )}
      </span>
      <span
        className={cn(
          "mt-4 inline-flex rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]",
          pillCls,
        )}
      >
        {when}
      </span>
      <p className="mt-3 font-display text-lg font-semibold tracking-tight">
        {title}
      </p>
      <p className="mt-2 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}
