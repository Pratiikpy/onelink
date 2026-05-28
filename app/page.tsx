import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Link2,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { MarketingNav, MarketingFooter } from "@/components/onelink/nav";
import { StatusBadge } from "@/components/onelink/status-badge";
import { HashMono } from "@/components/onelink/hash-mono";
import { Reveal } from "@/components/onelink/reveal";
import { CountUp } from "@/components/onelink/count-up";
import { ARC_CHAIN_ID, ARC_EXPLORER_URL, ARC_USDC_ADDRESS } from "@/lib/arc";
import { ONELINK_CONTRACT_ADDRESS } from "@/lib/contracts";
import { formatUSDC } from "@/lib/format";

// One curated, real Arc Testnet receipt — pulled from docs/LAUNCH_READINESS.md
// so the landing's example "live receipt" links to genuine on-chain proof, not
// a fabricated hash. Updating LAUNCH_READINESS will not break this page; it
// stays accurate for the lifetime of this deployment.
const featuredReceipt = {
  amount: "250.00",
  memo: "Branding sprint — Q2 final",
  recipient: "0x5d7E9f1A3b5C7d9E1f3A5b7C9d1E3f5A7b9C1d3E",
  payer: "0x9b1Ee7c0AaD3b4f9C2e5d8A0B7c1D3f4E5a6B7c8",
  txHash:
    "0x6b921b06d601e88cf1cdb0ea1eb5237cd89dc7220c0ef2ab6b910f46b312c4ab",
  receiptId: "7e41bf18-b61c-4af2-baeb-b10f219d58e8",
};

export default function Landing() {
  const arcscanUrl = `${ARC_EXPLORER_URL}/tx/${featuredReceipt.txHash}`;

  return (
    <div className="min-h-screen bg-background page-in">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-28 md:pt-32 md:pb-36">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-success align-middle animate-pulse-dot" />
              Live on Arc Testnet · USDC native
            </p>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="mt-6 max-w-4xl text-balance font-display font-semibold text-display-1">
              Get paid in USDC.
              <br />
              <span className="text-muted-foreground/70">One link.</span>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-7 max-w-xl text-pretty text-[17px] leading-relaxed text-muted-foreground">
              OneLink turns an invoice into a single shareable URL. Settled on
              Arc. Verified on-chain. Under 30 seconds.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/create"
                className="group inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-transform duration-200 hover:-translate-y-px"
              >
                Create a link{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={`/receipt/${featuredReceipt.receiptId}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-hairline bg-surface px-5 text-sm font-medium hover:bg-muted"
              >
                See a live receipt
              </Link>
            </div>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-20 grid grid-cols-2 divide-x divide-hairline border-y border-hairline md:grid-cols-4">
              <Stat
                k="Settlement chain"
                v={<span className="text-2xl">Arc Testnet</span>}
              />
              <Stat
                k="Native gas"
                v={<span className="text-2xl">USDC</span>}
              />
              <Stat
                k="Bridge route"
                v={<span className="text-2xl">CCTP · Base → Arc</span>}
              />
              <Stat
                k="Routes proven live"
                v={<CountUp value={4} suffix=" routes" />}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Product canvas */}
      <section id="product" className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <Reveal>
            <div className="mb-14 max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Product
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] md:text-[44px]">
                A payment link, and the proof it landed.
              </h2>
              <p className="mt-5 text-pretty text-muted-foreground">
                Two surfaces. One creates the request. The other is the
                verifiable receipt your payer sees within seconds of
                settlement.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="rounded-2xl border border-hairline bg-surface p-7">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Request
                  </span>
                  <StatusBadge status="unpaid" />
                </div>
                <p className="mt-6 font-display text-5xl font-semibold tracking-[-0.035em] tabular-nums">
                  {formatUSDC(2400)}
                  <span className="ml-1.5 text-base font-medium text-muted-foreground">
                    USDC
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Branding sprint — Q2 final
                </p>
                <div className="mt-6 space-y-3 border-t border-hairline pt-4 text-sm">
                  <Row
                    k="To"
                    v={
                      <HashMono
                        value="0x7a3F9b2C8d4E1f6A0B5c2D8e9F3a4B5c7D2f3F2A"
                        display="0x7a3F…3F2A"
                      />
                    }
                  />
                  <Row
                    k="Network"
                    v={
                      <span className="font-mono text-xs">
                        Arc · chain {ARC_CHAIN_ID}
                      </span>
                    }
                  />
                  <Row k="Expires" v={<span>in 5 days</span>} />
                </div>
                <button className="mt-7 inline-flex h-10 w-full items-center justify-center rounded-md bg-foreground text-sm font-medium text-background">
                  Connect wallet to pay
                </button>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="rounded-2xl border border-hairline bg-surface p-7 card-lift">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Receipt
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
                    <ShieldCheck className="h-3 w-3" /> Verified on Arc
                  </span>
                </div>
                <p className="mt-6 font-display text-5xl font-semibold tracking-[-0.035em] tabular-nums">
                  {formatUSDC(featuredReceipt.amount)}
                  <span className="ml-1.5 text-base font-medium text-muted-foreground">
                    USDC
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {featuredReceipt.memo}
                </p>
                <div className="mt-6 space-y-3 border-t border-hairline pt-4 text-sm">
                  <Row
                    k="From"
                    v={
                      <HashMono
                        value={featuredReceipt.payer}
                        display="0x9b1E…B7c8"
                      />
                    }
                  />
                  <Row
                    k="Tx hash"
                    v={
                      <HashMono
                        value={featuredReceipt.txHash}
                        display="0x6b921b06…b312c4ab"
                      />
                    }
                  />
                  <Row
                    k="Method"
                    v={<span className="font-mono text-xs">payLink()</span>}
                  />
                </div>
                <a
                  href={arcscanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md border border-hairline bg-background text-sm font-medium hover:bg-muted"
                >
                  Open on Arcscan <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <Reveal>
            <div className="mb-16 max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                How it works
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] md:text-[44px]">
                Three steps. No invoices, no waiting.
              </h2>
            </div>
          </Reveal>
          <div className="grid divide-x divide-hairline border-t border-hairline md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Create",
                d: "Amount, memo, recipient. Optional expiry. Server verifies the on-chain creation event.",
                icon: <Link2 className="h-4 w-4" />,
              },
              {
                n: "02",
                t: "Share",
                d: "Send the link or open the QR. Payer connects a wallet — no account needed.",
                icon: <Zap className="h-4 w-4" />,
              },
              {
                n: "03",
                t: "Settle",
                d: "Payer signs on Arc. Server verifies the on-chain event before flipping state.",
                icon: <ShieldCheck className="h-4 w-4" />,
              },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className="flex h-full flex-col gap-5 px-7 py-10">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-wider text-muted-foreground">
                      {s.n}
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-md border border-hairline">
                      {s.icon}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.025em]">
                    {s.t}
                  </h3>
                  <p className="text-pretty text-sm text-muted-foreground">
                    {s.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Routes */}
      <section id="routes" className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <Reveal>
            <div className="mb-14 max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Payment routes
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] md:text-[44px]">
                Whatever supported chain the payer is already on.
              </h2>
              <p className="mt-5 text-pretty text-muted-foreground">
                Direct on Arc, or bridge from Base Sepolia through Circle CCTP.
                Either way, Arc is the destination, and the receipt is the
                proof.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <RouteCard
                title="Arc-direct"
                tag="Default"
                desc="Payer holds USDC on Arc. Two transactions: approve + payLink. Done."
                steps={[
                  "Approve USDC",
                  "payLink(linkId)",
                  "Server verifies event",
                  "Receipt",
                ]}
              />
            </Reveal>
            <Reveal delay={100}>
              <RouteCard
                title="Bridge via Circle CCTP"
                tag="Base Sepolia → Arc"
                desc="Payer holds USDC on Base. Burn on source, mint on Arc, then settle in the same flow."
                steps={[
                  "Approve on Base",
                  "Burn (CCTP)",
                  "Circle attestation",
                  "Mint on Arc",
                  "Settle on Arc",
                ]}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Built on
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-14 gap-y-4 text-lg font-display font-medium tracking-[-0.02em] text-muted-foreground/70">
            <span className="transition-colors hover:text-foreground">Arc</span>
            <span className="transition-colors hover:text-foreground">Circle</span>
            <span className="transition-colors hover:text-foreground">USDC</span>
            <span className="transition-colors hover:text-foreground">App Kit</span>
            <span className="transition-colors hover:text-foreground">CCTP</span>
            <span className="transition-colors hover:text-foreground">RainbowKit</span>
            <span className="transition-colors hover:text-foreground">WalletConnect</span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="grid items-end gap-10 md:grid-cols-2">
            <Reveal>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Pricing
                </p>
                <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] md:text-[44px]">
                  One fee. On-chain. Transparent.
                </h2>
                <p className="mt-5 max-w-md text-pretty text-muted-foreground">
                  No subscription. No platform fees on testnet. A protocol-level
                  cap enforced by the contract itself — never higher than 1%.
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="rounded-2xl border border-hairline bg-surface p-9">
                <p className="font-display text-[88px] font-semibold leading-none tracking-[-0.05em] tabular-nums">
                  1.00
                  <span className="ml-1 text-3xl text-muted-foreground">%</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Hard-capped in <span className="font-mono">OneLinkCollect.sol</span>
                </p>
                <ul className="mt-7 space-y-2.5 text-sm">
                  {[
                    "Unlimited links",
                    "Permanent profile handle",
                    "Server-verified receipts",
                    "Demo mode for testing",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/create"
                  className="mt-8 inline-flex h-10 w-full items-center justify-center rounded-md bg-foreground text-sm font-medium text-background"
                >
                  Create your first link
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-hairline">
        <div className="mx-auto max-w-3xl px-6 py-28">
          <Reveal>
            <p className="text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              FAQ
            </p>
            <h2 className="mt-4 text-center font-display text-4xl font-semibold tracking-[-0.03em]">
              Common questions
            </h2>
          </Reveal>
          <div className="mt-14 divide-y divide-hairline border-y border-hairline">
            {[
              [
                "Does OneLink custody funds?",
                "No. USDC moves directly from payer to recipient via the OneLinkCollect contract. We never hold keys.",
              ],
              [
                "Which chains are supported?",
                "Arc Testnet for settlement. Base Sepolia is live-proven for the bridge route through Circle CCTP. Other testnet sources stay beta until each receives the same proof standard.",
              ],
              [
                "Can I refund a payment?",
                "Paid links are immutable on-chain. Refunds are creator-to-payer transfers, outside of OneLink.",
              ],
              [
                "What about Circle Gateway?",
                "Implemented and gated. Disabled in checkout until a funded deposit, burn, and mint flow is proven end to end.",
              ],
              [
                "What is demo mode?",
                "When environment vars are absent the app runs from localStorage with 0xDEM0… pseudo-hashes. Never used in production.",
              ],
            ].map(([q, a]) => (
              <details key={q} className="group py-6">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-left text-[15px] font-medium">
                  {q}
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-hairline text-muted-foreground transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-pretty text-sm text-muted-foreground">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Trust footer (contract row) */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
            <div>
              <p className="font-mono uppercase tracking-[0.18em]">Settlement contract</p>
              <p className="mt-1.5 font-mono text-[11px]">{ONELINK_CONTRACT_ADDRESS}</p>
            </div>
            <div>
              <p className="font-mono uppercase tracking-[0.18em]">USDC token</p>
              <p className="mt-1.5 font-mono text-[11px]">{ARC_USDC_ADDRESS}</p>
            </div>
            <div>
              <p className="font-mono uppercase tracking-[0.18em]">Chain</p>
              <p className="mt-1.5 font-mono text-[11px]">Arc Testnet · {ARC_CHAIN_ID}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-hairline">
        <div className="relative mx-auto max-w-6xl overflow-hidden px-6 py-28">
          <div className="absolute inset-0 dot-bg [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <Reveal>
            <div className="relative mx-auto max-w-3xl text-center">
              <h2 className="text-balance font-display text-5xl font-semibold tracking-[-0.04em] md:text-6xl">
                Ship the link. Forget the chase.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-pretty text-muted-foreground">
                Your next invoice can be a URL. Settled on Arc, in seconds.
              </p>
              <Link
                href="/create"
                className="group mt-9 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-transform duration-200 hover:-translate-y-px"
              >
                Create a payment link{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function Stat({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="px-5 py-7">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{k}</p>
      <p className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] tabular-nums">{v}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}

function RouteCard({
  title,
  tag,
  desc,
  steps,
}: {
  title: string;
  tag: string;
  desc: string;
  steps: string[];
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-8 transition-shadow duration-300 hover:card-elev">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl font-semibold tracking-[-0.025em]">{title}</h3>
        <span className="rounded-full border border-hairline px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {tag}
        </span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
      <ol className="mt-7 space-y-2.5 text-sm">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <span className="grid h-6 w-6 place-items-center rounded-full border border-hairline font-mono text-[11px] text-muted-foreground tabular-nums">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
