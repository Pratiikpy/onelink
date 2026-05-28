import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Layers,
  Lock,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react";

import { MarketingNav, MarketingFooter } from "@/components/onelink/nav";
import { Reveal } from "@/components/onelink/reveal";
import { ARC_CHAIN_ID, ARC_EXPLORER_URL } from "@/lib/arc";

export const metadata: Metadata = {
  title: "Pitch · OneLink",
  description:
    "OneLink in twelve slides. Wedge, proof, and the 7-day Codex build, optimized for hackathon judging.",
};

const directHash =
  "0x508ebf9ac99613534e82d768d423c0d30c274c57d30f0181c9cba6805e5ddd46";
const bridgeHash =
  "0x06907a47b9c79da2164efcd5fe9f58fe708969fee27af4563c3b232c860911ad";
const walletConnectHash =
  "0x2f5abeb1840cd6ed905cb3af6d72e7de7c6ad44c84a30050a79605eceea48daa";

function shortHash(h: string) {
  return `${h.slice(0, 8)}…${h.slice(-6)}`;
}

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-background page-in">
      <MarketingNav />

      <main className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        {/* 01 · Problem */}
        <Slide eyebrow="Slide 01 · Problem" number="01 / 12">
          <Headline>
            Stablecoins are global. Freelancer payments still aren&rsquo;t.
          </Headline>
          <Body>
            Every cross-chain USDC invoice becomes a support thread about
            wallets, networks, gas, and address formats. The asset works.
            The experience doesn&rsquo;t.
          </Body>
          <div className="mt-9 grid gap-3 md:grid-cols-2">
            {[
              "Different wallets per chain",
              "Wrong-network sends",
              "No verifiable proof of payment",
              "No professional shareable surface",
            ].map((it, i) => (
              <div
                key={it}
                className="flex items-center gap-3 rounded-xl border border-hairline bg-surface p-4"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted font-mono text-[11px] tabular-nums text-muted-foreground">
                  0{i + 1}
                </span>
                <span className="text-sm font-medium tracking-tight text-foreground/85 line-through decoration-destructive/40 decoration-2 underline-offset-2">
                  {it}
                </span>
              </div>
            ))}
          </div>
        </Slide>

        {/* 02 · The Wedge — HERO TREATMENT */}
        <SlideDivider />
        <Slide eyebrow="Slide 02 · The wedge" number="02 / 12">
          <div className="relative overflow-hidden rounded-3xl border border-hairline bg-surface p-8 md:p-12">
            <div className="pointer-events-none absolute inset-0 dot-bg [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/[0.08] px-2.5 py-1 text-[11px] font-medium text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
                Live on Arc Testnet
              </span>
              <h2 className="mt-6 font-display text-[44px] font-semibold leading-[1.05] tracking-[-0.04em] md:text-[88px]">
                USDC <span className="text-muted-foreground/50">is</span> the
                gas.
              </h2>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                One balance pays the invoice and the network fee. No
                ETH-for-gas dance, no &ldquo;please bridge first,&rdquo; no
                second token. The payer holds USDC, signs once, lands on Arc
                with sub-second finality.
              </p>
              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                <KeyStat k="Native gas" v="USDC" />
                <KeyStat k="ETH required" v="0" />
                <KeyStat k="Settlement finality" v="Sub-second" />
              </div>
            </div>
          </div>
        </Slide>

        {/* 03 · Why now */}
        <SlideDivider />
        <Slide eyebrow="Slide 03 · Why now" number="03 / 12">
          <Headline>The primitives finally line up.</Headline>
          <Body>
            Arc Testnet launched. Circle CCTP is mature. Stablecoin
            freelancing is finally tractable as a product, not just a thread
            on Twitter.
          </Body>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <PillarCard
              kicker="Settlement"
              title="Arc Testnet"
              body="USDC-native gas with deterministic finality."
            />
            <PillarCard
              kicker="Routing"
              title="Circle CCTP"
              body="Retry-safe burn-and-mint between every supported chain."
            />
            <PillarCard
              kicker="Distribution"
              title="Freelance work is global"
              body="Bank rails aren&rsquo;t. The wedge is wide-open."
            />
          </div>
        </Slide>

        {/* 04 · Solution */}
        <SlideDivider />
        <Slide eyebrow="Slide 04 · Solution" number="04 / 12">
          <Headline>One link, three surfaces, one source of truth.</Headline>
          <Body>
            OneLink replaces chain confusion with a single professional
            payment identity. Profile, invoice, or receipt &mdash; every
            surface points back to the same Arc contract.
          </Body>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <SurfaceMock
              tag="Profile"
              path="/{handle}"
              title="Studio Freelancer"
              detail="Permanent payer-initiated page"
              accent="@qa-202605…"
            />
            <SurfaceMock
              tag="Invoice"
              path="/pay/[slug]"
              title="0.25 USDC"
              detail="One-time link · locked amount + memo"
              accent="Branding sprint Q2"
            />
            <SurfaceMock
              tag="Receipt"
              path="/receipt/[id]"
              title="Paid · verified on Arc"
              detail="Server-verified · Arcscan-anchored"
              accent={shortHash(directHash)}
            />
          </div>
        </Slide>

        {/* 05 · Demo flow — HORIZONTAL TRACK */}
        <SlideDivider />
        <Slide eyebrow="Slide 05 · Demo flow" number="05 / 12">
          <Headline>Create &rarr; Pay &rarr; Settle &rarr; Receipt.</Headline>
          <Body>
            Four moments. Each one is a real screen on the live deployment,
            and each one is verified on Arc before state changes.
          </Body>
          <FlowTrack
            steps={[
              {
                k: "Create",
                v: "Creator signs invoice on Arc.",
                tag: "PaymentLinkCreated event",
              },
              {
                k: "Pay",
                v: "Payer picks Arc-direct or CCTP bridge.",
                tag: "Single signature",
              },
              {
                k: "Settle",
                v: "Server verifies on-chain transfer.",
                tag: "Contract is the truth",
              },
              {
                k: "Receipt",
                v: "Verified Arcscan tx, server-verified flag.",
                tag: "Ready in seconds",
              },
            ]}
          />
        </Slide>

        {/* 06 · Stack */}
        <SlideDivider />
        <Slide eyebrow="Slide 06 · Stack" number="06 / 12">
          <Headline>Three primitives, no detours.</Headline>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <PrimitiveCard
              icon={<Zap className="h-4 w-4" />}
              kicker="Arc Testnet"
              title={`USDC-native gas · chain ${ARC_CHAIN_ID}`}
              body="Sub-second finality. The contract is the source of truth."
            />
            <PrimitiveCard
              icon={<Layers className="h-4 w-4" />}
              kicker="Circle CCTP"
              title="Burn-and-mint Base &rarr; Arc"
              body="Retry-safe step events through Circle App Kit. Live-proven route."
            />
            <PrimitiveCard
              icon={<Lock className="h-4 w-4" />}
              kicker="Server verification"
              title="Browser asks. API verifies."
              body="The browser cannot mark paid. Only verified Arc events flip terminal state."
            />
          </div>
          <div className="mt-7 rounded-2xl border border-hairline bg-muted/30 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              How it stitches together
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 font-mono text-xs sm:gap-3">
              <PipelineNode>Payer wallet</PipelineNode>
              <PipelineArrow />
              <PipelineNode>USDC on source</PipelineNode>
              <PipelineArrow />
              <PipelineNode tone="accent">CCTP burn / mint</PipelineNode>
              <PipelineArrow />
              <PipelineNode tone="accent">Arc settlement</PipelineNode>
              <PipelineArrow />
              <PipelineNode tone="success">Verified receipt</PipelineNode>
            </div>
          </div>
        </Slide>

        {/* 07 · Proof — BIG METRICS + MOCK ARCSCAN */}
        <SlideDivider />
        <Slide eyebrow="Slide 07 · Proof" number="07 / 12">
          <Headline>Every claim has a hash you can re-check.</Headline>
          <Body>
            Public Vercel deployment. Public test artifacts. Public on-chain
            settlement. Nothing in this product is mocked.
          </Body>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <BigMetric value="27/27" label="Forge tests" />
            <BigMetric value="4" label="Routes proven live" />
            <BigMetric value="0" label="Open security alerts" />
            <BigMetric value="5×" label="Viewport QA coverage" />
          </div>

          {/* Mock Arcscan-style card */}
          <div className="mt-7 rounded-2xl border border-hairline bg-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-success text-success-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm font-medium tracking-tight text-success">
                  Verified on Arc
                </p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Arcscan
              </span>
            </div>
            <p className="mt-5 flex items-baseline gap-2 font-display text-4xl font-semibold leading-none tracking-[-0.035em] tabular-nums">
              <span>0.25</span>
              <span className="text-base font-medium tracking-tight text-muted-foreground">
                USDC
              </span>
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Direct Arc payment · server-verified
            </p>
            <div className="mt-5 grid gap-2 border-t border-hairline pt-4 text-sm">
              <KV k="Method" v="Direct on Arc" />
              <KV k="Source" v="ARC_TESTNET" />
              <KV k="Tx hash" v={shortHash(directHash)} mono />
            </div>
            <a
              href={`${ARC_EXPLORER_URL}/tx/${directHash}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-1 text-xs font-medium hover:underline"
            >
              Open on testnet.arcscan.app <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>

          {/* Other live tx hashes */}
          <div className="mt-4 rounded-xl border border-hairline bg-surface p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Other live-proven routes
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <ProofTx
                label="Base &rarr; Arc bridge reconciliation"
                hash={bridgeHash}
                href={`${ARC_EXPLORER_URL}/tx/${bridgeHash}`}
              />
              <ProofTx
                label="WalletConnect signed payment"
                hash={walletConnectHash}
                href={`${ARC_EXPLORER_URL}/tx/${walletConnectHash}`}
              />
            </ul>
            <p className="mt-5 text-xs text-muted-foreground">
              Full QA bundle:{" "}
              <Link
                href="/security"
                className="underline-offset-2 hover:underline"
              >
                /security
              </Link>{" "}
              ·{" "}
              <a
                href="https://github.com/Pratiikpy/onelink/tree/main/docs/test-results"
                className="underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                docs/test-results
              </a>
            </p>
          </div>
        </Slide>

        {/* 08 · Built with Codex — CODE BLOCK + DAY STRIP */}
        <SlideDivider />
        <Slide eyebrow="Slide 08 · Built with Codex" number="08 / 12">
          <Headline>One builder. One week. Codex everywhere.</Headline>
          <Body>
            OneLink&rsquo;s shippable surface area was built with Codex CLI
            inside a 7-day sprint. Not narrated &mdash; actually used to
            scaffold, refactor, and verify every layer of the product.
          </Body>

          {/* Code-block hero */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-hairline bg-foreground text-background">
            <div className="flex items-center justify-between border-b border-background/10 px-5 py-3">
              <div className="flex items-center gap-2 text-[11px] font-medium tracking-tight">
                <Terminal className="h-3.5 w-3.5" />
                <span className="font-mono">codex</span>
                <span className="text-background/50">·</span>
                <span className="text-background/60">day 03</span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-background/40">
                7-day sprint
              </span>
            </div>
            <pre className="overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-relaxed">
{`/goal port the Lovable design system end-to-end.
        keep all backend wiring (wagmi, Arc, CCTP, Supabase).
        replace black/lime brand with Apple-minimal light theme.
        ship 9 \`components/onelink/*\` primitives and 13 shadcn ui parts.
        verify lint, typecheck, build green before merging.

→ feat/lovable-design-port
→ 50 files, +6,500 lines
→ 27/27 forge tests · CI green · merged as #17`}
            </pre>
          </div>

          {/* Day-by-day strip */}
          <div className="mt-7 grid gap-3 md:grid-cols-5">
            <DayStripCard
              day="MON"
              label="Day 01"
              title="Lovable port lands"
              meta="PR #17 · ~6,500 lines"
            />
            <DayStripCard
              day="TUE"
              label="Day 02"
              title="Brand polish"
              meta="PR #18 · favicon, OG, Rainbow theme"
            />
            <DayStripCard
              day="WED"
              label="Day 03"
              title="a11y + brand kit"
              meta="PRs #19, #21 · /brand page"
            />
            <DayStripCard
              day="THU"
              label="Day 04"
              title="Audit + polish"
              meta="PRs #23, #24 · 7 medium fixes"
            />
            <DayStripCard
              day="FRI"
              label="Day 05"
              title="Pitch rewrite"
              meta="PR #25 · launch prep"
              active
            />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <CodexCard
              kicker="MCP toolchain"
              title="Arc · Circle · Supabase · Notion · Vercel · Playwright · Rabby"
              body="Live integrations let Codex test on real chains, real RPCs, and real wallet harnesses without leaving the loop."
            />
            <CodexCard
              kicker="Evidence-first QA"
              title="Codex-driven Playwright sweeps"
              body="Live-network scripts capture real tx hashes; visual QA across five viewports. Every claim links to an artifact."
            />
          </div>
        </Slide>

        {/* 09 · Audience */}
        <SlideDivider />
        <Slide eyebrow="Slide 09 · Audience" number="09 / 12">
          <Headline>
            Built for the people USDC is already winning over.
          </Headline>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <AudienceCard
              who="Web3-native freelancers"
              why="Already paid in USDC. Tired of route fragmentation."
            />
            <AudienceCard
              who="Designers, devs, consultants"
              why="International invoicing without bank rails or FX games."
            />
            <AudienceCard
              who="Creators"
              why="Tip jar plus invoice in a single shareable URL."
            />
            <AudienceCard
              who="Small agencies"
              why="Per-project invoices with verifiable on-chain receipts."
            />
          </div>
        </Slide>

        {/* 10 · Scope honesty — TWO COLUMN */}
        <SlideDivider />
        <Slide eyebrow="Slide 10 · Scope honesty" number="10 / 12">
          <Headline>What we ship vs what we don&rsquo;t.</Headline>
          <Body>
            We don&rsquo;t ship what we can&rsquo;t prove. Same truth in the
            live product, README, and pitch.
          </Body>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {/* Ship */}
            <div className="rounded-2xl border border-success/15 bg-success/[0.04] p-6">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-success text-success-foreground">
                  <Check className="h-4 w-4" />
                </span>
                <p className="font-display text-base font-semibold tracking-tight text-success">
                  Live & proven
                </p>
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                <ScopeLine status="ok" label="Arc Testnet · USDC-native settlement" />
                <ScopeLine status="ok" label="Base Sepolia &rarr; Arc via CCTP" />
                <ScopeLine status="ok" label="Profile + invoice + receipt surfaces" />
                <ScopeLine status="ok" label="Server-verified terminal state" />
              </ul>
            </div>
            {/* Don't ship */}
            <div className="rounded-2xl border border-hairline bg-muted/40 p-6">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-muted text-muted-foreground">
                  <X className="h-4 w-4" />
                </span>
                <p className="font-display text-base font-semibold tracking-tight text-muted-foreground">
                  Out of scope (today)
                </p>
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                <ScopeLine
                  status="gated"
                  label="Circle Gateway unified balance"
                />
                <ScopeLine status="off" label="Mainnet" />
                <ScopeLine status="off" label="Solana" />
                <ScopeLine status="off" label="Fiat / cards" />
              </ul>
            </div>
          </div>
        </Slide>

        {/* 11 · Roadmap — TIMELINE TRACK */}
        <SlideDivider />
        <Slide eyebrow="Slide 11 · Roadmap" number="11 / 12">
          <Headline>Testnet today. Mainnet next.</Headline>
          <Body>
            The work after the hackathon is unblocking the rails we already
            built &mdash; not adding new theatre.
          </Body>
          <div className="relative mt-10">
            <div
              className="absolute left-0 right-0 top-[18px] h-px bg-hairline md:block"
              aria-hidden
            />
            <div className="relative grid gap-6 md:grid-cols-3">
              <TimelinePoint
                when="Now"
                title="Arc Testnet"
                body="Direct + CCTP bridge live. Profile, invoice, receipt, dashboard, settings shipped."
                state="active"
              />
              <TimelinePoint
                when="Next"
                title="Mainnet pilot"
                body="Closed-cohort rollout once Gateway funded-flow proof + final security review land."
                state="upcoming"
              />
              <TimelinePoint
                when="After"
                title="Marketplace + agents"
                body="Profile-driven shopping, scheduled invoices, AI agents that close the loop end to end."
                state="future"
              />
            </div>
          </div>
        </Slide>

        {/* 12 · CTA */}
        <SlideDivider />
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Slide 12 · The ask
          </p>
          <div className="mx-auto mt-5 max-w-3xl text-center">
            <h2 className="font-display text-4xl font-semibold tracking-[-0.035em] md:text-[64px] md:leading-[1.05]">
              Try it. Break it. Tell us what you see.
            </h2>
            <p className="mt-7 text-lg leading-relaxed text-muted-foreground">
              The fastest way to understand OneLink is to send 0.25 testnet
              USDC and watch the receipt land on Arcscan.
            </p>
            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              <CtaButton
                href="/create"
                tone="primary"
                icon={<Send className="h-4 w-4" />}
                label="Send 0.25 testnet USDC"
              />
              <CtaButton
                href="https://github.com/Pratiikpy/onelink#visual-walkthrough"
                tone="ghost"
                external
                icon={<Sparkles className="h-4 w-4" />}
                label="Watch 90-second demo"
              />
              <CtaButton
                href="https://github.com/Pratiikpy/onelink/blob/main/docs/LAUNCH_READINESS.md"
                tone="ghost"
                external
                icon={<ArrowUpRight className="h-4 w-4" />}
                label="Read launch proof"
              />
            </div>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
              <span>onelink-mauve-nu.vercel.app</span>
              <span className="text-muted-foreground/50">·</span>
              <span>0 alerts</span>
              <span className="text-muted-foreground/50">·</span>
              <span>Built in 7 days with Codex CLI</span>
            </div>
          </div>
        </Reveal>
      </main>

      <MarketingFooter />
    </div>
  );
}

/* ---------- atoms ---------- */

function Slide({
  eyebrow,
  number,
  children,
}: {
  eyebrow: string;
  number: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal as="section">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </p>
        <p className="font-mono text-[10px] tabular-nums tracking-[0.2em] text-muted-foreground/60">
          {number}
        </p>
      </div>
      {children}
    </Reveal>
  );
}

function Headline({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.035em] md:text-[56px] md:leading-[1.08]">
      {children}
    </h2>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

function KeyStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-background/60 p-4 backdrop-blur">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {k}
      </p>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight">
        {v}
      </p>
    </div>
  );
}

function PillarCard({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {kicker}
      </p>
      <p className="mt-3 font-display text-lg font-semibold tracking-tight">
        {title}
      </p>
      <p
        className="mt-2 text-sm text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  );
}

function SurfaceMock({
  tag,
  path,
  title,
  detail,
  accent,
}: {
  tag: string;
  path: string;
  title: string;
  detail: string;
  accent: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-surface">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {tag}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/70">
          {path}
        </span>
      </div>
      <div className="p-5">
        <p className="font-display text-base font-semibold tracking-tight">
          {title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        <p className="mt-4 font-mono text-[11px] text-muted-foreground/80">
          {accent}
        </p>
      </div>
    </div>
  );
}

function FlowTrack({
  steps,
}: {
  steps: { k: string; v: string; tag: string }[];
}) {
  return (
    <div className="mt-9 grid gap-3 md:grid-cols-4">
      {steps.map(({ k, v, tag }, i) => (
        <div key={k} className="relative">
          <div className="rounded-2xl border border-hairline bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Step {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/60">
                {String(i + 1)}/4
              </span>
            </div>
            <p className="mt-4 font-display text-lg font-semibold tracking-tight">
              {k}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">{v}</p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-hairline bg-background px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {tag}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div
              className="absolute -right-3 top-1/2 hidden -translate-y-1/2 md:block"
              aria-hidden
            >
              <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PrimitiveCard({
  icon,
  kicker,
  title,
  body,
}: {
  icon: React.ReactNode;
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-6">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background">
          {icon}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {kicker}
        </span>
      </div>
      <p
        className="mt-4 font-display text-base font-semibold tracking-tight"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <p
        className="mt-2 text-sm text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  );
}

function PipelineNode({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "accent" | "success";
}) {
  const cls =
    tone === "success"
      ? "border-success/20 bg-success/[0.08] text-success"
      : tone === "accent"
      ? "border-foreground/15 bg-background text-foreground"
      : "border-hairline bg-background text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 ${cls}`}
    >
      {children}
    </span>
  );
}

function PipelineArrow() {
  return <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden />;
}

function BigMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-6">
      <p className="font-display text-[44px] font-semibold leading-none tracking-[-0.04em] tabular-nums md:text-[56px]">
        {value}
      </p>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function KV({
  k,
  v,
  mono,
}: {
  k: string;
  v: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className={mono ? "font-mono text-xs" : "font-medium"}>{v}</span>
    </div>
  );
}

function ProofTx({
  label,
  hash,
  href,
}: {
  label: string;
  hash: string;
  href: string;
}) {
  return (
    <li className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span
        className="text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: label }}
      />
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 self-start font-mono text-xs hover:underline sm:self-auto"
      >
        {shortHash(hash)} <ArrowUpRight className="h-3 w-3" />
      </a>
    </li>
  );
}

function DayStripCard({
  day,
  label,
  title,
  meta,
  active,
}: {
  day: string;
  label: string;
  title: string;
  meta: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-surface p-4 ${
        active ? "border-foreground/40" : "border-hairline"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
            active ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {day}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
          {label}
        </span>
      </div>
      <p className="mt-3 font-display text-sm font-semibold tracking-tight">
        {title}
      </p>
      <p className="mt-1 font-mono text-[10px] text-muted-foreground">
        {meta}
      </p>
    </div>
  );
}

function CodexCard({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {kicker}
      </p>
      <p className="mt-3 font-display text-base font-semibold tracking-tight">
        {title}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function AudienceCard({ who, why }: { who: string; why: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5">
      <p className="font-display text-lg font-semibold tracking-tight">
        {who}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{why}</p>
    </div>
  );
}

function ScopeLine({
  status,
  label,
}: {
  status: "ok" | "gated" | "off";
  label: string;
}) {
  const meta =
    status === "ok"
      ? {
          icon: <Check className="h-3.5 w-3.5 text-success" />,
          tone: "text-foreground",
        }
      : status === "gated"
      ? {
          icon: <Lock className="h-3.5 w-3.5 text-warning-foreground" />,
          tone: "text-foreground/80",
        }
      : {
          icon: <X className="h-3.5 w-3.5 text-muted-foreground/60" />,
          tone: "text-muted-foreground line-through decoration-muted-foreground/30",
        };
  return (
    <li className="flex items-center gap-2.5">
      <span className="grid h-5 w-5 shrink-0 place-items-center">
        {meta.icon}
      </span>
      <span
        className={meta.tone}
        dangerouslySetInnerHTML={{ __html: label }}
      />
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
      ? "bg-foreground border-foreground"
      : state === "upcoming"
      ? "bg-background border-foreground/40"
      : "bg-background border-hairline";
  const pillCls =
    state === "active"
      ? "border-foreground/40 bg-foreground text-background"
      : "border-hairline bg-surface text-muted-foreground";
  return (
    <div className="flex flex-col items-center text-center">
      <span
        className={`relative z-10 grid h-9 w-9 place-items-center rounded-full border-2 ${dotCls}`}
      >
        {state === "active" && (
          <span className="h-1.5 w-1.5 rounded-full bg-background" />
        )}
      </span>
      <span
        className={`mt-4 inline-flex rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${pillCls}`}
      >
        {when}
      </span>
      <p className="mt-3 font-display text-lg font-semibold tracking-tight">
        {title}
      </p>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function CtaButton({
  href,
  label,
  icon,
  tone,
  external,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  tone: "primary" | "ghost";
  external?: boolean;
}) {
  const cls =
    tone === "primary"
      ? "bg-foreground text-background hover:-translate-y-px"
      : "border border-hairline bg-surface hover:bg-muted";
  const Comp: typeof Link = Link;
  return (
    <Comp
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`inline-flex h-12 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-medium transition-transform duration-200 ${cls}`}
    >
      {icon} {label}
    </Comp>
  );
}

function SlideDivider() {
  return <div className="my-20 h-px bg-hairline md:my-28" />;
}
