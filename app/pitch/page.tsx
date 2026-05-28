import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Layers,
  Lock,
  Send,
  Sparkles,
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
        <Slide eyebrow="Slide 01 · Problem">
          <Headline>
            Stablecoins are global. Freelancer payments still aren&rsquo;t.
          </Headline>
          <Body>
            Every cross-chain USDC invoice becomes a support thread about
            wallets, networks, gas, and address formats. The asset works.
            The experience doesn&rsquo;t.
          </Body>
          <BulletGrid
            items={[
              "Different wallets per chain",
              "Wrong-network sends",
              "No verifiable proof of payment",
              "No professional shareable surface",
            ]}
          />
        </Slide>

        {/* 02 · The Wedge */}
        <SlideDivider />
        <Slide eyebrow="Slide 02 · The wedge">
          <Headline>
            On Arc, USDC <em className="not-italic text-muted-foreground/60">is</em>{" "}
            the gas.
          </Headline>
          <Body>
            One balance pays the invoice and the network fee. No ETH-for-gas
            dance, no &ldquo;please bridge first,&rdquo; no second token. The
            payer holds USDC, signs once, lands on Arc with sub-second
            finality.
          </Body>
          <CardGrid>
            <BigCard
              kicker="USDC-native settlement"
              title="One token. Zero detours."
              body="Arc treats USDC as native gas, so the payer never needs a second asset to clear an invoice."
            />
            <BigCard
              kicker="Sub-second finality"
              title="Receipt lands in seconds."
              body="Deterministic finality on Arc means the verified receipt drops as soon as the tx is mined."
            />
          </CardGrid>
        </Slide>

        {/* 03 · Why now */}
        <SlideDivider />
        <Slide eyebrow="Slide 03 · Why now">
          <Headline>The primitives finally line up.</Headline>
          <Body>
            Arc Testnet launched. Circle CCTP is mature and covers the chains
            freelancers actually use. Stablecoin freelancing is finally
            tractable as a product, not just a thread on Twitter.
          </Body>
          <Timeline
            items={[
              {
                k: "Settlement",
                v: "Arc Testnet brings USDC-native gas with deterministic finality.",
              },
              {
                k: "Routing",
                v: "Circle CCTP delivers retry-safe burn-and-mint between every supported chain.",
              },
              {
                k: "Distribution",
                v: "Freelance work is global; bank rails aren&rsquo;t. The wedge is wide-open.",
              },
            ]}
          />
        </Slide>

        {/* 04 · Solution */}
        <SlideDivider />
        <Slide eyebrow="Slide 04 · Solution">
          <Headline>One link, three surfaces, one source of truth.</Headline>
          <Body>
            OneLink replaces chain confusion with a single professional
            payment identity. Profile, invoice, or receipt &mdash; every
            surface points back to the same Arc contract.
          </Body>
          <CardGrid cols={3}>
            <SurfaceCard
              kicker="Profile"
              path="/{handle}"
              body="Permanent payer-initiated page. Pick amount, memo, route."
            />
            <SurfaceCard
              kicker="Invoice"
              path="/pay/[slug]"
              body="One-time link with locked amount, memo, and expiry."
            />
            <SurfaceCard
              kicker="Receipt"
              path="/receipt/[id]"
              body="Verified Arc settlement &mdash; the contract is the truth."
            />
          </CardGrid>
        </Slide>

        {/* 05 · Demo flow */}
        <SlideDivider />
        <Slide eyebrow="Slide 05 · Demo flow">
          <Headline>Create &rarr; Pay &rarr; Settle &rarr; Receipt.</Headline>
          <Body>
            Four moments. Each one is a real screen on the live deployment,
            and each one is verified on Arc before state changes.
          </Body>
          <FlowSteps
            steps={[
              {
                n: "01",
                k: "Create",
                v: "Creator signs the invoice on Arc. Server verifies the PaymentLinkCreated event before persisting.",
              },
              {
                n: "02",
                k: "Pay",
                v: "Payer opens the link, picks Arc-direct or Base&rarr;Arc CCTP bridge, signs once.",
              },
              {
                n: "03",
                k: "Settle",
                v: "Server watches Arc for the matching transfer; only writes paid after on-chain confirmation.",
              },
              {
                n: "04",
                k: "Receipt",
                v: "Verified Arcscan transaction, server-verified flag, full proof drawer for re-checking.",
              },
            ]}
          />
        </Slide>

        {/* 06 · Stack */}
        <SlideDivider />
        <Slide eyebrow="Slide 06 · Stack">
          <Headline>Three primitives, no detours.</Headline>
          <CardGrid cols={3}>
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
          </CardGrid>
        </Slide>

        {/* 07 · Proof */}
        <SlideDivider />
        <Slide eyebrow="Slide 07 · Proof">
          <Headline>Every claim has a hash you can re-check.</Headline>
          <Body>
            Public Vercel deployment. Public test artifacts. Public on-chain
            settlement. Nothing in this product is mocked.
          </Body>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ProofMetric value="27 / 27" label="Forge tests passing" />
            <ProofMetric value="4" label="Routes proven live" />
            <ProofMetric value="0" label="Open security alerts" />
            <ProofMetric value="5 viewports" label="Visual QA coverage" />
          </div>
          <div className="mt-6 rounded-2xl border border-hairline bg-surface p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Real Arcscan tx hashes
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <ProofTx
                label="Direct Arc payment"
                hash={directHash}
                href={`${ARC_EXPLORER_URL}/tx/${directHash}`}
              />
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

        {/* 08 · Built with Codex */}
        <SlideDivider />
        <Slide eyebrow="Slide 08 · Built with Codex">
          <Headline>One builder. One week. Codex everywhere.</Headline>
          <Body>
            OneLink&rsquo;s shippable surface area was built with Codex CLI
            inside a 7-day sprint. Not narrated &mdash; actually used to
            scaffold, refactor, and verify every layer of the product.
          </Body>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <CodexCard
              kicker="Workflow"
              title="/goal-driven sprints"
              body="Each PR opened with a /goal that locked scope and acceptance criteria before any code was written."
            />
            <CodexCard
              kicker="Automation"
              title="MCP-connected toolchain"
              body="Live integrations with Arc, Circle, Supabase, Notion, Vercel, Playwright, and the Rabby wallet harness."
            />
            <CodexCard
              kicker="Loop"
              title="Iterative PR + test cycle"
              body="Every change shipped behind a feature branch with lint, typecheck, build, and Foundry gates."
            />
            <CodexCard
              kicker="Evidence"
              title="Codex-driven QA scripts"
              body="Live-network Playwright sweeps capture real tx hashes; visual QA across five viewports."
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-medium text-muted-foreground">
            <Tag>9 PRs · 4 days</Tag>
            <Tag>Lovable design port</Tag>
            <Tag>Server-verified state</Tag>
            <Tag>27 Foundry tests</Tag>
            <Tag>Live QA on every flow</Tag>
          </div>
        </Slide>

        {/* 09 · Audience */}
        <SlideDivider />
        <Slide eyebrow="Slide 09 · Audience">
          <Headline>
            Built for the people USDC is already winning over.
          </Headline>
          <CardGrid cols={2}>
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
          </CardGrid>
        </Slide>

        {/* 10 · Scope honesty */}
        <SlideDivider />
        <Slide eyebrow="Slide 10 · Scope honesty">
          <Headline>What we ship vs what we don&rsquo;t.</Headline>
          <Body>
            We don&rsquo;t ship what we can&rsquo;t prove. Every row below is
            visible inside the live product and the README so judges and
            users see the same truth.
          </Body>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <ScopeRow
              status="live"
              label="Arc Testnet · USDC-native settlement"
            />
            <ScopeRow status="live" label="Base Sepolia &rarr; Arc via CCTP" />
            <ScopeRow status="live" label="Profile + invoice + receipt surfaces" />
            <ScopeRow status="live" label="Server-verified terminal state" />
            <ScopeRow status="gated" label="Circle Gateway unified balance" />
            <ScopeRow status="out" label="Mainnet" />
            <ScopeRow status="out" label="Solana" />
            <ScopeRow status="out" label="Fiat / cards" />
          </div>
        </Slide>

        {/* 11 · Roadmap */}
        <SlideDivider />
        <Slide eyebrow="Slide 11 · Roadmap">
          <Headline>Testnet today. Mainnet next.</Headline>
          <Body>
            The work after the hackathon is unblocking the rails we already
            built &mdash; not adding new theatre.
          </Body>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            <RoadmapCard
              when="Now"
              title="Arc Testnet"
              body="Direct + CCTP bridge live. Profile, invoice, receipt, dashboard, settings shipped."
            />
            <RoadmapCard
              when="Next"
              title="Mainnet pilot"
              body="Closed-cohort mainnet rollout once Gateway funded-flow proof and final security review land."
            />
            <RoadmapCard
              when="After"
              title="Marketplace + agents"
              body="Profile-driven shopping, scheduled invoices, and AI agents that close the loop end to end."
            />
          </div>
        </Slide>

        {/* 12 · CTA */}
        <SlideDivider />
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Slide 12 · The ask
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.035em] md:text-[52px] md:leading-[1.08]">
              Try it. Break it. Tell us what you see.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              The fastest way to understand OneLink is to send 0.25 testnet
              USDC and watch the receipt land on Arcscan.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Link
                href="/create"
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-transform duration-200 hover:-translate-y-px"
              >
                <Send className="h-4 w-4" /> Send 0.25 testnet USDC
              </Link>
              <Link
                href="https://github.com/Pratiikpy/onelink#visual-walkthrough"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full border border-hairline bg-surface px-5 text-sm font-medium hover:bg-muted"
              >
                <Sparkles className="h-4 w-4" /> Watch 90-second demo
              </Link>
              <Link
                href="https://github.com/Pratiikpy/onelink/blob/main/docs/LAUNCH_READINESS.md"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full border border-hairline bg-surface px-5 text-sm font-medium hover:bg-muted"
              >
                Read launch proof <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-7 text-xs text-muted-foreground">
              <Link href="/" className="underline-offset-2 hover:underline">
                onelink-mauve-nu.vercel.app
              </Link>{" "}
              · Built in 7 days with Codex CLI.
            </p>
          </div>
        </Reveal>
      </main>

      <MarketingFooter />
    </div>
  );
}

/* ---------- helpers ---------- */

function Slide({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal as="section">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {eyebrow}
      </p>
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

function BulletGrid({ items }: { items: string[] }) {
  return (
    <ul className="mt-7 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
      {items.map((it) => (
        <li key={it} className="flex items-start gap-2">
          <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function CardGrid({
  children,
  cols = 2,
}: {
  children: React.ReactNode;
  cols?: 2 | 3;
}) {
  return (
    <div
      className={`mt-8 grid gap-3 ${
        cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
      }`}
    >
      {children}
    </div>
  );
}

function BigCard({
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
      <p className="mt-3 font-display text-xl font-semibold tracking-tight">
        {title}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function SurfaceCard({
  kicker,
  path,
  body,
}: {
  kicker: string;
  path: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {kicker}
      </p>
      <p className="mt-3 font-mono text-[13px]">{path}</p>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
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
      <div className="flex items-center gap-2 text-foreground">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background">
          {icon}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {kicker}
        </span>
      </div>
      <p className="mt-4 font-display text-base font-semibold tracking-tight">
        {title}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Timeline({ items }: { items: { k: string; v: string }[] }) {
  return (
    <div className="mt-8 grid gap-3 md:grid-cols-3">
      {items.map(({ k, v }) => (
        <div
          key={k}
          className="rounded-2xl border border-hairline bg-surface p-5"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {k}
          </p>
          <p
            className="mt-3 text-sm leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: v }}
          />
        </div>
      ))}
    </div>
  );
}

function FlowSteps({
  steps,
}: {
  steps: { n: string; k: string; v: string }[];
}) {
  return (
    <ol className="mt-8 grid gap-3 md:grid-cols-2">
      {steps.map(({ n, k, v }) => (
        <li
          key={n}
          className="rounded-2xl border border-hairline bg-surface p-5"
        >
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[12px] tabular-nums text-muted-foreground/80">
              {n}
            </span>
            <span className="font-display text-base font-semibold tracking-tight">
              {k}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{v}</p>
        </li>
      ))}
    </ol>
  );
}

function ProofMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5">
      <p className="font-display text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
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

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-hairline bg-surface px-3 py-1">
      {children}
    </span>
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

function ScopeRow({
  status,
  label,
}: {
  status: "live" | "gated" | "out";
  label: string;
}) {
  const meta =
    status === "live"
      ? {
          icon: <Check className="h-3.5 w-3.5" />,
          tone: "border-success/20 bg-success/[0.08] text-success",
          tag: "Live",
        }
      : status === "gated"
      ? {
          icon: <Lock className="h-3.5 w-3.5" />,
          tone:
            "border-warning/30 bg-warning/[0.08] text-warning-foreground",
          tag: "Gated",
        }
      : {
          icon: <X className="h-3.5 w-3.5" />,
          tone: "border-hairline bg-muted/40 text-muted-foreground",
          tag: "Out of scope",
        };
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-hairline bg-surface px-4 py-3 text-sm">
      <span
        className="text-foreground/90"
        dangerouslySetInnerHTML={{ __html: label }}
      />
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${meta.tone}`}
      >
        {meta.icon}
        {meta.tag}
      </span>
    </div>
  );
}

function RoadmapCard({
  when,
  title,
  body,
}: {
  when: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {when}
      </p>
      <p className="mt-3 font-display text-lg font-semibold tracking-tight">
        {title}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function SlideDivider() {
  return <div className="my-20 h-px bg-hairline md:my-28" />;
}
