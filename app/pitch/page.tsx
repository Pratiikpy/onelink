import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { MarketingNav, MarketingFooter } from "@/components/onelink/nav";
import { Reveal } from "@/components/onelink/reveal";
import { ARC_CHAIN_ID } from "@/lib/arc";

export const metadata: Metadata = {
  title: "Pitch",
  description: "OneLink in four moves: problem, solution, stack, audience.",
};

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-background page-in">
      <MarketingNav />
      <main className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        {/* Slide 1: Problem */}
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Slide 01 · Problem
          </p>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.035em] md:text-[64px] md:leading-[1.08]">
            Freelancer payments break at the chain step.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Stablecoins are global. The payment experience is still
            fragmented. Every payment becomes a technical-support thread
            about wallets, networks, and address formats.
          </p>
          <ul className="mt-7 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            <li>· Different wallets per chain</li>
            <li>· Wrong-network sends</li>
            <li>· No verifiable proof of payment</li>
            <li>· No professional shareable surface</li>
          </ul>
        </Reveal>

        {/* Slide 2: Solution */}
        <SlideDivider />
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Slide 02 · Solution
          </p>
          <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.035em] md:text-[56px]">
            One link. Supported USDC routes. Verified receipt.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            OneLink replaces chain confusion with a single professional
            payment page. The freelancer creates a profile or invoice link.
            The client opens it, picks a supported USDC route, and pays. The
            server verifies the on-chain event before flipping to paid.
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              ["Profile", "/{handle} permanent page"],
              ["Invoice", "/pay/[slug] one-time link"],
              ["Receipt", "/receipt/[id] verified proof"],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-2xl border border-hairline bg-surface p-5"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {title}
                </p>
                <p className="mt-2 font-display text-lg font-semibold tracking-tight">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Slide 3: Stack */}
        <SlideDivider />
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Slide 03 · Stack
          </p>
          <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.035em] md:text-[56px]">
            Built on Arc and Circle, with proof-first engineering.
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Live-tested on Arc Testnet", "WalletConnect", "CCTP Base → Arc", "0 open alerts"].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-hairline bg-surface px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground"
                >
                  {chip}
                </span>
              ),
            )}
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-2">
            {[
              ["Settlement", `Arc Testnet · chain ${ARC_CHAIN_ID} · USDC native gas`],
              ["Bridge", "Circle App Kit · CCTP burn/mint route"],
              ["Wallets", "wagmi, viem, RainbowKit, WalletConnect/Reown"],
              ["Contract", "Solidity 0.8.28 · 27 Foundry tests"],
              ["Storage", "Supabase RLS + immutability triggers"],
              ["Frontend", "Next.js 15 · React 19 · TypeScript · Tailwind"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-start gap-3 rounded-xl border border-hairline bg-surface p-4"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {k}
                  </p>
                  <p className="mt-1 text-sm font-medium">{v}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Slide 4: Audience */}
        <SlideDivider />
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Slide 04 · Audience
          </p>
          <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.035em] md:text-[56px]">
            For freelancers who want crypto payments to feel professional.
          </h2>
          <ul className="mt-7 grid gap-3 md:grid-cols-2">
            {[
              ["Web3-native freelancers", "Already accept USDC, suffer from route fragmentation."],
              ["Designers, devs, consultants", "International invoicing without bank rails."],
              ["Creators", "Tip jar + invoice in one shareable URL."],
              ["Small agencies", "Per-project invoices with verifiable receipts."],
            ].map(([who, why]) => (
              <li
                key={who}
                className="rounded-xl border border-hairline bg-surface p-5"
              >
                <p className="font-display text-lg font-semibold tracking-tight">
                  {who}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{why}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* CTA */}
        <SlideDivider />
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              The ask
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.035em] md:text-[52px]">
              Try the live app. Read the proof.
            </h2>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/create"
                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-6 text-sm font-medium text-background"
              >
                Create a payment link <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/whitepaper"
                className="inline-flex h-11 items-center rounded-full border border-hairline bg-surface px-6 text-sm font-medium hover:bg-muted"
              >
                Read whitepaper
              </Link>
            </div>
          </div>
        </Reveal>
      </main>
      <MarketingFooter />
    </div>
  );
}

function SlideDivider() {
  return <div className="my-20 h-px bg-hairline md:my-28" />;
}
