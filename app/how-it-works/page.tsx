import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Link2,
  Receipt,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { MarketingNav, MarketingFooter } from "@/components/onelink/nav";
import { Reveal } from "@/components/onelink/reveal";
import { ARC_CHAIN_ID, ARC_EXPLORER_URL, ARC_USDC_ADDRESS } from "@/lib/arc";
import { ONELINK_CONTRACT_ADDRESS } from "@/lib/contracts";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How OneLink turns an invoice into a server-verified USDC receipt on Arc Testnet — the flow, the trust model, the Arc + Circle integration, and links to verify every claim yourself.",
};

// A real Arc Testnet settlement tx (from docs/LAUNCH_READINESS.md) so the
// "verify it yourself" link points at genuine on-chain proof.
const PROOF_TX =
  "0x6b921b06d601e88cf1cdb0ea1eb5237cd89dc7220c0ef2ab6b910f46b312c4ab";

const STEPS = [
  {
    n: "01",
    t: "Create",
    d: "The creator signs one Arc transaction to register the link. The server verifies the on-chain PaymentLinkCreated event before the invoice is ever stored.",
    icon: <Link2 className="h-4 w-4" />,
  },
  {
    n: "02",
    t: "Share",
    d: "The link (or its QR) goes to the payer. No account, no signup — they just connect a wallet when they're ready to pay.",
    icon: <ArrowRight className="h-4 w-4" />,
  },
  {
    n: "03",
    t: "Pay",
    d: "The payer settles directly on Arc, or bridges USDC in from Base Sepolia via Circle CCTP. USDC is the native gas — no ETH required.",
    icon: <Wallet className="h-4 w-4" />,
  },
  {
    n: "04",
    t: "Verify",
    d: "The server watches Arc for the matching PaymentCompleted event and only then writes the final paid state. The receipt links the exact Arcscan transaction.",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
];

const LAYERS = [
  {
    role: "Settlement",
    name: "Arc Testnet",
    detail:
      "Chain 5042002. USDC is the native gas token, so a payer never needs ETH. Sub-second deterministic finality.",
  },
  {
    role: "Bridge",
    name: "Circle CCTP · App Kit",
    detail:
      "Native USDC burn-and-mint from Base Sepolia into Arc, with retry-safe step events surfaced live in the pay flow.",
  },
  {
    role: "Unified balance",
    name: "Circle Gateway",
    detail:
      "Implemented end-to-end but gated — disabled in checkout until a funded deposit, burn, and mint flow is proven.",
  },
  {
    role: "Proof",
    name: "Arcscan + server reconcile",
    detail:
      "Final state is written by the server only after the on-chain event is verified. The contract, not the browser, is the source of truth.",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background page-in">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-16 md:pt-32 md:pb-20">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              How it works
            </p>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="mt-6 max-w-3xl text-balance font-display text-4xl font-semibold tracking-[-0.03em] md:text-[52px] md:leading-[1.05]">
              From invoice to a receipt you can re-check on-chain.
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-muted-foreground">
              OneLink never asks you to trust it. Every final state is written
              by a server that has already verified the matching Arc Testnet
              event on-chain — and every receipt links the transaction so you
              can confirm it yourself.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-[12px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
              Testnet · USDC-native · server-verified
            </span>
          </Reveal>
        </div>
      </section>

      {/* The flow */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal>
            <div className="mb-14 max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                The flow
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                Four steps, two of them verified on-chain.
              </h2>
            </div>
          </Reveal>
          <div className="grid divide-y divide-hairline border-y border-hairline md:grid-cols-4 md:divide-x md:divide-y-0">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 70}>
                <div className="flex h-full flex-col gap-5 px-6 py-9">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-wider text-muted-foreground">
                      {s.n}
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-md border border-hairline">
                      {s.icon}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">
                    {s.t}
                  </h3>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                    {s.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trust model */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1fr] md:items-center">
            <Reveal>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Trust model
                </p>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                  The browser asks. The chain decides.
                </h2>
                <p className="mt-5 text-pretty text-muted-foreground">
                  A client can claim anything. OneLink&apos;s API refuses to
                  write a <span className="font-mono text-foreground">paid</span>{" "}
                  or <span className="font-mono text-foreground">cancelled</span>{" "}
                  state until it has matched the corresponding event from the
                  OneLinkCollect contract on Arc. There is no path where the UI
                  alone can fake a settlement.
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <ol className="space-y-3">
                {[
                  {
                    k: "Creation",
                    v: "Stored only after the PaymentLinkCreated event is verified.",
                  },
                  {
                    k: "Settlement",
                    v: "Marked paid only after the PaymentCompleted event is verified.",
                  },
                  {
                    k: "Receipt",
                    v: "Anchored to the exact Arcscan transaction, with a server-verified flag.",
                  },
                ].map((row, i) => (
                  <li
                    key={row.k}
                    className="flex items-start gap-4 rounded-xl border border-hairline bg-surface p-4"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-hairline font-mono text-[11px] text-muted-foreground tabular-nums">
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{row.k}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {row.v}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Arc + Circle */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal>
            <div className="mb-12 max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Arc + Circle integration
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                What each layer is actually doing.
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            {LAYERS.map((l, i) => (
              <Reveal key={l.role} delay={i * 80}>
                <div className="h-full rounded-2xl border border-hairline bg-surface p-7">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {l.role}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.025em]">
                    {l.name}
                  </h3>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {l.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Verify it yourself */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal>
            <div className="mb-12 max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Verify it yourself
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                Don&apos;t take our word for it.
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            <ProofLink
              external
              href={`${ARC_EXPLORER_URL}/tx/${PROOF_TX}`}
              label="A real Arc settlement"
              sub="Open the on-chain transaction on Arcscan"
              icon={<Receipt className="h-4 w-4" />}
            />
            <ProofLink
              external
              href="https://github.com/Pratiikpy/onelink"
              label="The source code"
              sub="OneLinkCollect.sol, the verify routes, and tests"
              icon={<ArrowUpRight className="h-4 w-4" />}
            />
            <ProofLink
              href="/whitepaper"
              label="Whitepaper"
              sub="Thesis, architecture, and verified scope"
              icon={<ArrowRight className="h-4 w-4" />}
            />
            <ProofLink
              href="/security"
              label="Security & scope"
              sub="Exactly what's proven — and what's gated"
              icon={<ShieldCheck className="h-4 w-4" />}
            />
          </div>

          {/* On-chain reference */}
          <div className="mt-8 grid gap-3 rounded-2xl border border-hairline bg-surface p-6 text-xs text-muted-foreground sm:grid-cols-3">
            <div>
              <p className="font-mono uppercase tracking-[0.18em]">
                Settlement contract
              </p>
              <p className="mt-1.5 break-all font-mono text-[11px]">
                {ONELINK_CONTRACT_ADDRESS}
              </p>
            </div>
            <div>
              <p className="font-mono uppercase tracking-[0.18em]">USDC token</p>
              <p className="mt-1.5 break-all font-mono text-[11px]">
                {ARC_USDC_ADDRESS}
              </p>
            </div>
            <div>
              <p className="font-mono uppercase tracking-[0.18em]">Chain</p>
              <p className="mt-1.5 font-mono text-[11px]">
                Arc Testnet · {ARC_CHAIN_ID}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Honest scope */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="text-pretty text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Scope, stated plainly:</span>{" "}
            OneLink is testnet-ready on Arc Testnet. It is not mainnet-ready;
            Circle Gateway checkout is implemented but gated until a funded
            end-to-end proof; Solana, fiat, and cards are not implemented. The
            product language never claims more than what is proven live.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-hairline">
        <div className="relative mx-auto max-w-6xl overflow-hidden px-6 py-24">
          <div className="absolute inset-0 dot-bg [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <Reveal>
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-balance font-display text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
                See it land in seconds.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-pretty text-muted-foreground">
                Create a link, pay it on Arc, and watch the verified receipt
                appear.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/create"
                  className="group inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-transform duration-200 hover:-translate-y-px"
                >
                  Create a link{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/pitch"
                  className="inline-flex h-11 items-center gap-1.5 rounded-full border border-hairline bg-surface px-6 text-sm font-medium hover:bg-muted"
                >
                  See the pitch
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function ProofLink({
  href,
  label,
  sub,
  icon,
  external = false,
}: {
  href: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  external?: boolean;
}) {
  const inner = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-hairline bg-background text-muted-foreground transition-colors group-hover:text-foreground">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {sub}
        </span>
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </>
  );
  const className =
    "group flex items-center gap-4 rounded-xl border border-hairline bg-surface p-4 transition-colors hover:bg-muted";
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
