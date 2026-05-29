"use client";

import type { ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";

import { MarketingNav, MarketingFooter } from "@/components/onelink/nav";
import { Reveal } from "@/components/onelink/reveal";
import { Logo, LogoMark } from "@/components/onelink/logo";
import { StatusBadge } from "@/components/onelink/status-badge";
import { Button } from "@/components/ui/button";
import type { PaymentStatus } from "@/lib/payments";
import { cn } from "@/lib/utils";

// NOTE: this page documents the v2 design system as actually shipped. Every
// value below is read off the real tokens (tailwind.config.ts + globals.css)
// and the real components (Button, StatusBadge, Logo). It is a reference, not
// a marketing page — accuracy over flourish.

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-background page-in">
      <MarketingNav />

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:pt-24">
        {/* ── HERO ─────────────────────────────────────────────── */}
        <Reveal as="section">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Brand kit · v2 · accurate to ship
          </p>
          <h1 className="mt-6 max-w-3xl text-balance font-display text-5xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-[64px] md:leading-[1.04]">
            The OneLink <span className="text-brand">brand kit.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-[17px] leading-relaxed text-muted-foreground">
            A calm, precise identity for a payments product. Plenty of white,
            one confident blue, type that gets out of the way. Trustworthy by
            restraint.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              "Stripe-clean",
              "Mercury-calm",
              "Linear-precise",
              "USDC · Arc",
            ].map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center rounded-full border border-hairline bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
              >
                {chip}
              </span>
            ))}
          </div>
        </Reveal>

        {/* ── 01 · LOGO ────────────────────────────────────────── */}
        <Section index="01" title="Logo">
          <p>
            The OneLink mark is an <strong className="font-medium text-foreground">open ring</strong>{" "}
            — two interlocking monoline arcs forming a chain-link &ldquo;O&rdquo;,
            optically centered inside a soft squircle. It is drawn in{" "}
            <code className="font-mono text-[13px] text-foreground">currentColor</code>,
            so it inherits whatever surface it sits on. Give it room; never
            recolor the arcs.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            <SwatchCard label="Mark · 32px">
              <LogoMark size={32} />
            </SwatchCard>
            <SwatchCard label="Mark · 48px">
              <LogoMark size={48} />
            </SwatchCard>
            <SwatchCard label="Mark · 96px">
              <LogoMark size={96} />
            </SwatchCard>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SwatchCard label="Horizontal lockup">
              <Logo size={32} />
            </SwatchCard>
            <SwatchCard label="Stacked lockup">
              <Logo size={48} variant="stacked" />
            </SwatchCard>
          </div>

          <p className="mt-6 rounded-xl border border-hairline bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Usage —</span> default
            to the framed mark on light. Pair with the lowercase{" "}
            <span className="font-mono">onelink</span> wordmark for the lockup.
            Don&apos;t outline, gradient, or rotate the arcs (a subtle hover tilt
            on the lockup is the only motion the mark allows).
          </p>
        </Section>

        {/* ── 02 · TYPE ────────────────────────────────────────── */}
        <Section index="02" title="Type">
          <p>
            One family does all the work.{" "}
            <strong className="font-medium text-foreground">Geist</strong> for
            display and body — a calm grotesque with real tabular numbers — and{" "}
            <strong className="font-medium text-foreground">Geist Mono</strong>{" "}
            for hashes, addresses, amounts, and eyebrow labels. Headlines run
            tight (<span className="font-mono">-0.03em</span>); body stays
            relaxed and readable.
          </p>

          <div className="mt-9 space-y-4">
            <TypeRow
              label="Display"
              meta="font-display · ~64px · semibold · -0.03em"
            >
              <p className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-[56px]">
                Get paid in USDC.
              </p>
            </TypeRow>

            <TypeRow label="Heading · h2" meta="font-display · 32px · semibold · -0.03em">
              <p className="font-display text-[32px] font-semibold tracking-[-0.03em]">
                One link. Verified on-chain.
              </p>
            </TypeRow>

            <TypeRow label="Body" meta="font-sans · 17px · leading-relaxed">
              <p className="max-w-xl text-[17px] leading-relaxed text-muted-foreground">
                OneLink turns an invoice into a single shareable URL. It settles
                on Arc Testnet and verifies on-chain — status follows
                settlement, never the other way around.
              </p>
            </TypeRow>

            <TypeRow label="Small / caption" meta="font-sans · 13px · muted">
              <p className="text-[13px] text-muted-foreground">
                Testnet only · non-custodial · every claim has a hash you can
                re-check.
              </p>
            </TypeRow>

            <TypeRow label="Mono" meta="font-mono · 13px · tabular-nums">
              <p className="break-all font-mono text-[13px] tabular-nums text-foreground">
                0x9b7D5B4DAD4c9B1065908FA8C6C34d697E3cBD0c
              </p>
            </TypeRow>

            <TypeRow label="Mono · eyebrow" meta="font-mono · 11px · uppercase · 0.22em">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Live on Arc Testnet · USDC native gas
              </p>
            </TypeRow>
          </div>
        </Section>

        {/* ── 03 · COLOR ───────────────────────────────────────── */}
        <Section index="03" title="Color">
          <p>
            Off-white, ink, and one blue. The page stays calm warm-white and
            ink; blue (<span className="font-mono">#1E50E5</span>) is the accent
            — reserved for the money action, links, and verified state. USDC has
            its own brand blue for chain marks; green means settled. Swatches
            below render the real Tailwind tokens.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ColorCard
              token="background"
              hex="#FBFBF8"
              role="Page · warm off-white"
              swatchClass="bg-background border border-hairline"
            />
            <ColorCard
              token="foreground"
              hex="#101114"
              role="Ink · body + default fills"
              swatchClass="bg-foreground"
              onDark
            />
            <ColorCard
              token="surface"
              hex="#FFFFFF"
              role="Cards · sticky bars"
              swatchClass="bg-surface border border-hairline"
            />
            <ColorCard
              token="brand"
              hex="#1E50E5"
              role="Brand blue · money CTA"
              swatchClass="bg-brand"
              onDark
              accent
            />
            <ColorCard
              token="brand-tint"
              hex="#EDF1FE"
              role="Blue wash · highlights"
              swatchClass="bg-brand-tint"
            />
            <ColorCard
              token="brand-text"
              hex="#1742C4"
              role="Blue text · on tint"
              swatchClass="bg-brand-text"
              onDark
            />
            <ColorCard
              token="usdc"
              hex="#2775CA"
              role="USDC mark · chain swatch"
              swatchClass="bg-usdc"
              onDark
            />
            <ColorCard
              token="success"
              hex="#2D6857"
              role="Verified · paid · settled"
              swatchClass="bg-success"
              onDark
            />
            <ColorCard
              token="muted-foreground"
              hex="#6B6E75"
              role="Secondary text"
              swatchClass="bg-muted-foreground"
              onDark
            />
          </div>
        </Section>

        {/* ── 04 · COMPONENTS ──────────────────────────────────── */}
        <Section index="04" title="Components">
          <p>
            These are the live components, not pictures of them.{" "}
            <code className="font-mono text-[13px] text-foreground">Button</code>{" "}
            is the one canonical CTA geometry (single radius, one tactile
            hover/press, reduced-motion safe). Black is the workhorse;{" "}
            <span className="text-brand">blue</span> is the money action.
          </p>

          {/* Buttons */}
          <div className="mt-9 rounded-2xl border border-hairline bg-surface p-7 card-elev">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Button · variants
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button variant="brand">
                Pay 250 USDC <ArrowRight />
              </Button>
              <Button variant="default">Create link</Button>
              <Button variant="outline">View receipt</Button>
              <Button variant="ghost">Cancel</Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="brand" size="sm">
                Small
              </Button>
              <Button variant="brand" size="default">
                Default
              </Button>
              <Button variant="brand" size="lg">
                Large
              </Button>
              <Button variant="brand" size="xl">
                Extra large
              </Button>
              <Button variant="brand" loading>
                Settling
              </Button>
            </div>
          </div>

          {/* Status badges */}
          <div className="mt-4 rounded-2xl border border-hairline bg-surface p-7 card-elev">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              StatusBadge · states
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {(
                [
                  "paid",
                  "processing",
                  "unpaid",
                  "expired",
                  "cancelled",
                  "failed",
                ] as PaymentStatus[]
              ).map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Status follows settlement. A link only reads{" "}
              <span className="font-medium text-foreground">Paid</span> after the
              contract confirms — server-verified, never optimistic.
            </p>
          </div>

          {/* Sample card + pill */}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Sample settlement card — the card-lift treatment */}
            <div className="rounded-2xl border border-hairline bg-surface p-7 card-lift">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Sample card · card-lift
                </p>
                <StatusBadge status="paid" />
              </div>
              <p className="mt-5 font-display text-5xl font-semibold tabular-nums tracking-[-0.03em]">
                250.00
                <span className="ml-2 align-baseline font-mono text-base font-normal tracking-normal text-muted-foreground">
                  USDC
                </span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Design retainer · settled on Arc Testnet
              </p>
              <div className="mt-5 flex items-center gap-2">
                <Button variant="brand" size="sm" className="flex-1">
                  Pay this link <ArrowRight />
                </Button>
                <Button variant="outline" size="sm">
                  Copy
                </Button>
              </div>
            </div>

            {/* Pills + tints */}
            <div className="rounded-2xl border border-hairline bg-surface p-7 card-elev">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Pills · tints
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Pill>
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
                  All systems on Arc Testnet
                </Pill>
                <Pill>
                  <span className="h-2 w-2 rounded-full bg-usdc" />
                  USDC
                </Pill>
                <Pill className="border-brand/25 bg-brand-tint text-brand-text">
                  <Check className="size-3" />
                  Verified on-chain
                </Pill>
                <Pill className="font-mono">chain 5042002</Pill>
                <Pill>Testnet</Pill>
              </div>
              <div className="mt-6 rounded-xl bg-brand-tint p-4">
                <p className="text-sm text-brand-text">
                  <span className="font-medium">Brand tint</span> — the only
                  large blue surface allowed. Use it to frame a single highlight,
                  never as a page background.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 05 · VOICE ───────────────────────────────────────── */}
        <Section index="05" title="Voice">
          <p>
            Plain, present, never apologetic. We say only what we can prove, and
            we name what we don&apos;t support. Confidence comes from evidence,
            not adjectives.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {[
              {
                head: "Honest about scope.",
                body: "Arc-direct and Base→Arc bridging are live-proven. Gateway unified-balance is implemented but gated — we label it that way, every time.",
              },
              {
                head: "Plain language.",
                body: "No jargon walls, no hype. “Settled on Arc Testnet,” not “revolutionary cross-chain settlement layer.”",
              },
              {
                head: "Proof-first.",
                body: "Every claim has a hash you can re-check. 27/27 contract tests, 0 open security alerts, real Arcscan transactions.",
              },
              {
                head: "Say only what you can prove.",
                body: "No unproven latency numbers, no “any chain,” no mainnet or KYC claims. Settlement before status, always.",
              },
            ].map((v) => (
              <div
                key={v.head}
                className="rounded-2xl border border-hairline bg-surface p-6"
              >
                <p className="flex items-center gap-2 font-display text-lg font-semibold tracking-[-0.02em]">
                  <Check className="size-4 text-brand" />
                  {v.head}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {v.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <VoiceExample tone="say" text="Settled on Arc Testnet in this transaction — here's the hash." />
            <VoiceExample tone="avoid" text="The fastest, most revolutionary payments on any chain." />
          </div>
        </Section>
      </main>

      <MarketingFooter />
    </div>
  );
}

/* ── Section shell ──────────────────────────────────────────── */
function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Reveal as="section" className="mt-20 border-t border-hairline pt-12 md:mt-24">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] tabular-nums text-brand">{index}</span>
        <h2 className="font-display text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {title}
        </h2>
      </div>
      <div className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </Reveal>
  );
}

/* ── Logo swatch frame ──────────────────────────────────────── */
function SwatchCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-hairline bg-surface p-8">
      <div className="grid h-28 place-items-center">{children}</div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

/* ── Color swatch ───────────────────────────────────────────── */
function ColorCard({
  token,
  hex,
  role,
  swatchClass,
  onDark,
  accent,
}: {
  token: string;
  hex: string;
  role: string;
  swatchClass: string;
  onDark?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-surface">
      <div className={cn("grid h-24 place-items-center", swatchClass)}>
        <span
          className={cn(
            "font-mono text-[11px] tabular-nums tracking-wide",
            onDark
              ? accent
                ? "text-brand-foreground"
                : "text-background"
              : "text-muted-foreground",
          )}
        >
          {hex}
        </span>
      </div>
      <div className="space-y-1 p-4">
        <p className="font-mono text-[12px] text-foreground">{token}</p>
        <p className="text-[12px] text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}

/* ── Type row ───────────────────────────────────────────────── */
function TypeRow({
  label,
  meta,
  children,
}: {
  label: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-6 md:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="font-mono text-[11px] text-muted-foreground">{meta}</p>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

/* ── Pill ───────────────────────────────────────────────────── */
function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1.5 text-[12px] text-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ── Voice say/avoid example ────────────────────────────────── */
function VoiceExample({ tone, text }: { tone: "say" | "avoid"; text: string }) {
  const isSay = tone === "say";
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        isSay ? "border-success/20 bg-success/5" : "border-hairline bg-muted/40",
      )}
    >
      <p
        className={cn(
          "font-mono text-[11px] uppercase tracking-[0.18em]",
          isSay ? "text-success" : "text-muted-foreground",
        )}
      >
        {isSay ? "Say this" : "Avoid"}
      </p>
      <p
        className={cn(
          "mt-2 text-[15px] leading-relaxed",
          isSay ? "text-foreground" : "text-muted-foreground line-through decoration-muted-foreground/30",
        )}
      >
        {text}
      </p>
    </div>
  );
}
