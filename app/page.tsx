"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Link2,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import { MarketingNav, MarketingFooter } from "@/components/onelink/nav";
import { Reveal } from "@/components/onelink/reveal";
import { CountUp } from "@/components/onelink/count-up";
import { StatusBadge } from "@/components/onelink/status-badge";
import { Button } from "@/components/ui/button";
import { ARC_CHAIN_ID } from "@/lib/arc";
import { cn } from "@/lib/utils";

// The one canonical app domain (per the accuracy map). Used for the generated
// link preview in the interactive builder so the URL the user sees is real.
const APP_HOST = "onelink-mauve-nu.vercel.app";

// A real, on-chain Base Sepolia → Arc bridge settlement. Linked from the
// "Watch a payment" section so the route visual ends in genuine proof.
const BRIDGE_TX =
  "0x06907a47b9c79da2164efcd5fe9f58fe708969fee27af4563c3b232c860911ad";

// A real example receipt the hero CTA points at.
const EXAMPLE_RECEIPT = "7e41bf18-b61c-4af2-baeb-b10f219d58e8";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background page-in">
      <MarketingNav />
      <Hero />
      <ChainRow />
      <Steps />
      <LinkBuilder />
      <WatchPayment />
      <Education />
      <Stats />
      <ClosingCTA />
      <MarketingFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1 · HERO                                                            */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[440px] w-[440px] rounded-full bg-brand/10 blur-[120px]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-20 md:grid-cols-[1.05fr_0.95fr] md:pb-28 md:pt-28">
        {/* Left column */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
              Live on Arc Testnet · USDC-native
            </span>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="mt-6 max-w-2xl text-balance font-display font-semibold tracking-[-0.03em] text-display-1">
              Get paid in <span className="text-brand">USDC</span>.
              <br />
              One link.
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-7 max-w-xl text-pretty text-[17px] leading-relaxed text-muted-foreground">
              OneLink turns an invoice into one shareable link. Your payer opens
              it, pays in USDC, and it settles on Arc — with a server-verified
              receipt you can both re-check on-chain. USDC is the gas, so there
              is no ETH to keep around.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button variant="brand" size="lg" asChild className="group">
                <Link href="/create">
                  Create a link
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href={`/receipt/${EXAMPLE_RECEIPT}`}>
                  See a live receipt
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <span>No code</span>
              <span className="text-hairline">·</span>
              <span>Non-custodial</span>
              <span className="text-hairline">·</span>
              <span>USDC is gas</span>
            </p>
          </Reveal>
        </div>

        {/* Right column — sample payment card */}
        <Reveal delay={160} className="md:justify-self-end">
          <SamplePaymentCard />
        </Reveal>
      </div>
    </section>
  );
}

function SamplePaymentCard() {
  return (
    <div className="relative w-full max-w-sm">
      <div
        aria-hidden
        className="absolute -inset-3 rounded-[28px] bg-gradient-to-b from-brand/8 to-transparent blur-xl"
      />
      <div className="relative rounded-2xl border border-hairline bg-card p-7 card-lift">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Payment request
          </span>
          <StatusBadge status="unpaid" />
        </div>

        <p className="mt-7 font-display text-[44px] font-semibold leading-none tracking-[-0.04em] tabular-nums">
          $250.00
          <span className="ml-1.5 align-top text-base font-medium text-muted-foreground">
            USDC
          </span>
        </p>

        <div className="mt-7 space-y-3 border-t border-hairline pt-5 text-sm">
          <CardRow
            k="To"
            v={<span className="font-mono text-xs">0x7a2f…91c4</span>}
          />
          <CardRow
            k="Memo"
            v={
              <span className="text-right">Branding work · invoice #0042</span>
            }
          />
          <CardRow
            k="Network"
            v={
              <span className="font-mono text-xs">
                Arc · chain {ARC_CHAIN_ID}
              </span>
            }
          />
        </div>

        {/* Decorative: this is a poster of the real pay button, not interactive. */}
        <div
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none mt-7 inline-flex h-11 w-full select-none items-center justify-center gap-2 rounded-xl bg-brand text-sm font-medium text-brand-foreground shadow-sm"
        >
          <Wallet className="h-4 w-4" />
          Connect wallet to pay
        </div>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Settlement before status · server-verified
        </p>
      </div>
    </div>
  );
}

function CardRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="min-w-0 truncate text-right">{v}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · CHAIN ROW                                                       */
/* ------------------------------------------------------------------ */

const BRIDGE_SOURCES = [
  { name: "Base", color: "#0052FF", beta: false },
  { name: "Ethereum", color: "#627EEA", beta: true },
  { name: "Arbitrum", color: "#28A0F0", beta: true },
  { name: "Polygon", color: "#8247E5", beta: true },
];

function ChainRow() {
  return (
    <section className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Reveal>
          <div className="flex flex-col items-center gap-7 text-center md:flex-row md:justify-between md:text-left">
            <p className="max-w-xs text-pretty text-sm text-muted-foreground">
              Settles on{" "}
              <span className="font-medium text-foreground">Arc</span> · bridges
              in via{" "}
              <span className="font-medium text-foreground">Circle CCTP</span>{" "}
              from
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
              {BRIDGE_SOURCES.map((c) => (
                <span
                  key={c.name}
                  className="inline-flex items-center gap-2 text-[15px] font-medium tracking-[-0.01em]"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.name}
                  {c.beta && (
                    <span className="rounded-full border border-hairline px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                      beta
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3 · THREE STEPS                                                     */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    n: "01",
    t: "Create",
    d: "Set an amount, a memo, and the recipient. Optional expiry. We register it and verify the on-chain creation event.",
    icon: <Link2 className="h-4 w-4" />,
  },
  {
    n: "02",
    t: "Share",
    d: "Send the link or show the QR. Your payer opens it and connects any wallet — no account, no sign-up.",
    icon: <Send className="h-4 w-4" />,
  },
  {
    n: "03",
    t: "Get paid",
    d: "They sign on Arc. The server verifies the on-chain event before flipping the status — then both of you get the receipt.",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
];

function Steps() {
  return (
    <section id="how" className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <Reveal>
          <div className="mb-14 max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              How it works
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] md:text-[44px]">
              Three steps. Thirty seconds.
            </h2>
          </div>
        </Reveal>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <div className="group flex h-full flex-col gap-5 bg-surface px-7 py-10 transition-colors hover:bg-card">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-wider text-muted-foreground">
                    {s.n}
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-hairline bg-background text-foreground transition-colors group-hover:border-brand/30 group-hover:text-brand">
                    {s.icon}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold tracking-[-0.025em]">
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
  );
}

/* ------------------------------------------------------------------ */
/* 4 · INTERACTIVE LINK BUILDER                                        */
/* ------------------------------------------------------------------ */

const EXPIRY_OPTIONS = [
  { label: "Never", value: "never" },
  { label: "1 day", value: "1d" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
] as const;

function randomSlug() {
  // Mirrors the look of a real OneLink slug without colliding with one.
  return Math.random().toString(36).slice(2, 8);
}

function LinkBuilder() {
  const [amount, setAmount] = useState("250");
  const [memo, setMemo] = useState("Branding work · invoice #0042");
  const [expiry, setExpiry] = useState<(typeof EXPIRY_OPTIONS)[number]["value"]>(
    "7d",
  );
  const [slug, setSlug] = useState("a1b2c3");
  const [copied, setCopied] = useState(false);

  // Slug is generated client-side after mount so SSR + hydration stay stable.
  useEffect(() => {
    setSlug(randomSlug());
  }, []);

  const prettyAmount = useMemo(() => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return "0.00";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  }, [amount]);

  const expiryLabel = useMemo(() => {
    switch (expiry) {
      case "1d":
        return "in 1 day";
      case "7d":
        return "in 7 days";
      case "30d":
        return "in 30 days";
      default:
        return "No expiry";
    }
  }, [expiry]);

  const fullLink = `${APP_HOST}/pay/${slug}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${fullLink}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <section id="build" className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <Reveal>
          <div className="mb-12 max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Try it
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] md:text-[44px]">
              Build a link. Watch it form.
            </h2>
            <p className="mt-5 text-pretty text-muted-foreground">
              Type an amount and a memo — the payment card and the shareable URL
              update live. This is exactly what your payer would see.
            </p>
          </div>
        </Reveal>

        <div className="grid items-start gap-6 md:grid-cols-2">
          {/* Builder controls */}
          <Reveal>
            <div className="rounded-2xl border border-hairline bg-surface p-7">
              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Amount (USDC)
                </span>
                <div className="mt-2 flex items-center rounded-xl border border-hairline bg-background px-4 transition-colors focus-within:border-brand/40">
                  <span className="font-display text-2xl text-muted-foreground">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    className="w-full bg-transparent py-3 pl-2 font-display text-2xl tabular-nums outline-none placeholder:text-muted-foreground/70"
                    placeholder="0.00"
                    aria-label="Amount in USDC"
                  />
                </div>
              </label>

              <label className="mt-6 block">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Memo
                </span>
                <input
                  type="text"
                  value={memo}
                  maxLength={60}
                  onChange={(e) => setMemo(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-hairline bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-brand/40"
                  placeholder="What's this for?"
                  aria-label="Payment memo"
                />
              </label>

              <div className="mt-6">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Expires
                </span>
                <div className="mt-2 grid grid-cols-4 gap-1 rounded-xl border border-hairline bg-background p-1">
                  {EXPIRY_OPTIONS.map((opt) => {
                    const active = expiry === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setExpiry(opt.value)}
                        aria-pressed={active}
                        className={cn(
                          "rounded-lg py-2 text-[13px] font-medium transition-all duration-200",
                          active
                            ? "bg-foreground text-background shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Generated link */}
              <div className="mt-7 rounded-xl border border-hairline bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Your link
                  </span>
                  <button
                    type="button"
                    onClick={() => setSlug(randomSlug())}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RefreshCw className="h-3 w-3" /> New
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-foreground">
                    {fullLink}
                  </code>
                  <Button
                    size="sm"
                    variant={copied ? "secondary" : "default"}
                    onClick={onCopy}
                    className="shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Live preview */}
          <Reveal delay={120} className="md:sticky md:top-24">
            <div className="rounded-2xl border border-hairline bg-card p-7 card-lift">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Live preview
                </span>
                <StatusBadge status="unpaid" />
              </div>
              <p className="mt-7 font-display text-[44px] font-semibold leading-none tracking-[-0.04em] tabular-nums transition-opacity">
                ${prettyAmount}
                <span className="ml-1.5 align-top text-base font-medium text-muted-foreground">
                  USDC
                </span>
              </p>
              <p className="mt-3 min-h-[1.25rem] text-sm text-muted-foreground">
                {memo || "—"}
              </p>
              <div className="mt-6 space-y-3 border-t border-hairline pt-5 text-sm">
                <CardRow
                  k="Network"
                  v={
                    <span className="font-mono text-xs">
                      Arc · chain {ARC_CHAIN_ID}
                    </span>
                  }
                />
                <CardRow k="Expires" v={<span>{expiryLabel}</span>} />
                <CardRow
                  k="Settles in"
                  v={<span className="font-mono text-xs">USDC</span>}
                />
              </div>
              <div
                aria-hidden="true"
                tabIndex={-1}
                className="pointer-events-none mt-7 inline-flex h-11 w-full select-none items-center justify-center gap-2 rounded-xl bg-brand text-sm font-medium text-brand-foreground shadow-sm"
              >
                <Wallet className="h-4 w-4" />
                Pay ${prettyAmount} USDC
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5 · WATCH A PAYMENT (route visual + mini receipt)                   */
/* ------------------------------------------------------------------ */

const ROUTE_STEPS = [
  {
    label: "Base",
    sub: "USDC burned at source",
    color: "#0052FF",
  },
  {
    label: "Circle CCTP",
    sub: "Attestation issued",
    color: "#2775CA",
  },
  {
    label: "Arc",
    sub: "Minted + settled",
    color: "#1E50E5",
  },
];

function WatchPayment() {
  const [active, setActive] = useState(-1);
  const ref = useRef<HTMLDivElement | null>(null);

  // Step the route to life once, when it scrolls into view. Reduced-motion
  // users get the finished state immediately.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setActive(ROUTE_STEPS.length);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setActive(ROUTE_STEPS.length);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          ROUTE_STEPS.forEach((_, i) => {
            timers.push(setTimeout(() => setActive(i), 350 + i * 650));
          });
          timers.push(
            setTimeout(
              () => setActive(ROUTE_STEPS.length),
              350 + ROUTE_STEPS.length * 650,
            ),
          );
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  const settled = active >= ROUTE_STEPS.length;

  return (
    <section id="watch" className="border-t border-hairline bg-foreground text-background">
      <div ref={ref} className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <Reveal>
          <div className="mb-14 max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-background/55">
              Watch a payment
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] md:text-[44px]">
              From another chain, into Arc.
            </h2>
            <p className="mt-5 text-pretty text-background/65">
              When a payer holds USDC on Base, OneLink bridges it through Circle
              CCTP and settles on Arc — all in one flow. Here is a real one.
            </p>
          </div>
        </Reveal>

        <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
          {/* Route visual */}
          <Reveal>
            <div className="rounded-2xl border border-background/12 bg-background/[0.04] p-6 backdrop-blur-sm sm:p-9">
              <div className="flex items-center justify-between gap-2">
                {ROUTE_STEPS.map((step, i) => {
                  const reached = active >= i;
                  return (
                    <div
                      key={step.label}
                      className="flex flex-1 flex-col items-center gap-3 text-center"
                    >
                      <span
                        className={cn(
                          "grid h-12 w-12 place-items-center rounded-full border text-[13px] font-semibold transition-all duration-500",
                          reached
                            ? "border-transparent text-white"
                            : "border-background/20 text-background/40",
                        )}
                        style={
                          reached
                            ? { backgroundColor: step.color }
                            : undefined
                        }
                      >
                        {reached && i < active ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          i + 1
                        )}
                      </span>
                      <div>
                        <p
                          className={cn(
                            "text-sm font-medium transition-colors duration-500",
                            reached ? "text-background" : "text-background/40",
                          )}
                        >
                          {step.label}
                        </p>
                        <p
                          className={cn(
                            "mt-0.5 text-[11px] transition-colors duration-500",
                            reached
                              ? "text-background/55"
                              : "text-background/25",
                          )}
                        >
                          {step.sub}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* connecting track */}
              <div className="relative mx-6 mt-[-58px] mb-[58px] hidden sm:block">
                <div className="h-px bg-background/15" />
                <div
                  className="absolute left-0 top-0 h-px bg-brand transition-[width] duration-700 ease-out"
                  style={{
                    width:
                      active <= 0
                        ? "0%"
                        : active >= ROUTE_STEPS.length
                          ? "100%"
                          : `${(active / (ROUTE_STEPS.length - 1)) * 100}%`,
                  }}
                />
              </div>

              <a
                href={`https://testnet.arcscan.app/tx/${BRIDGE_TX}`}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-1.5 font-mono text-[11px] text-background/60 transition-colors hover:text-background"
              >
                {settled ? "Verified" : "Settlement"} tx on Arcscan{" "}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </Reveal>

          {/* Mini verified receipt */}
          <Reveal delay={140}>
            <div
              className={cn(
                "rounded-2xl border bg-background p-6 text-foreground transition-all duration-700",
                settled
                  ? "border-success/30 opacity-100"
                  : "border-background/12 opacity-60",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Receipt
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors duration-500",
                    settled
                      ? "border-success/20 bg-success/10 text-success"
                      : "border-hairline bg-muted text-muted-foreground",
                  )}
                >
                  <ShieldCheck className="h-3 w-3" />
                  {settled ? "Verified on Arc" : "Settling…"}
                </span>
              </div>
              <p className="mt-6 font-display text-4xl font-semibold tracking-[-0.035em] tabular-nums">
                $250.00
                <span className="ml-1.5 align-top text-sm font-medium text-muted-foreground">
                  USDC
                </span>
              </p>
              <div className="mt-5 space-y-3 border-t border-hairline pt-4 text-sm">
                <CardRow
                  k="Route"
                  v={<span className="font-mono text-xs">Base → Arc · CCTP</span>}
                />
                <CardRow
                  k="Tx hash"
                  v={
                    <span className="font-mono text-xs">0x0690…11ad</span>
                  }
                />
                <CardRow
                  k="Method"
                  v={<span className="font-mono text-xs">payLink()</span>}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 6 · EDUCATIONAL ACCORDION                                           */
/* ------------------------------------------------------------------ */

const FAQ: Array<[string, string]> = [
  [
    "What is USDC?",
    "USDC is a fully-reserved dollar stablecoin issued by Circle: one USDC is redeemable for one US dollar. On OneLink every amount is in USDC, so a $250 link means $250 — no token-price guesswork.",
  ],
  [
    "What is Arc?",
    "Arc is the testnet blockchain where payments settle. It is unusual in that USDC is its native gas token — so paying a link costs USDC, not a separate coin like ETH. That keeps the experience to a single currency.",
  ],
  [
    "What is bridging (CCTP)?",
    "If your payer holds USDC on another chain such as Base, Circle's Cross-Chain Transfer Protocol burns it there and mints fresh USDC on Arc. OneLink runs that bridge and the final settlement in one flow, so the payer never leaves the link.",
  ],
  [
    "Do I need a wallet?",
    "The payer needs a self-custody wallet (like MetaMask or any WalletConnect wallet) to sign the payment. There is no OneLink account, no sign-up, and no app to install — just the link.",
  ],
  [
    "Is it safe?",
    "OneLink is non-custodial: USDC moves directly from payer to recipient through the settlement contract, and we never hold keys. The status only flips after the server verifies the on-chain event, and every claim on a receipt has a transaction hash you can re-check yourself.",
  ],
];

function Education() {
  return (
    <section id="learn" className="border-t border-hairline">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-28">
        <Reveal>
          <div className="mb-12 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              New to this?
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em]">
              The honest, plain-language version.
            </h2>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="divide-y divide-hairline border-y border-hairline">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-[15px] font-medium">
                  {q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hairline text-muted-foreground transition-transform duration-300 group-open:rotate-45 group-hover:text-foreground">
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 7 · STATS BAND                                                      */
/* ------------------------------------------------------------------ */

const STATS = [
  {
    value: <CountUp value={27} />,
    suffix: "/27",
    label: "Contract tests passing",
  },
  {
    value: <CountUp value={0} />,
    suffix: "",
    label: "Open security alerts",
  },
  {
    prefix: "≤",
    value: <CountUp value={1} />,
    suffix: "%",
    label: "Fee, capped on-chain",
  },
  {
    value: <CountUp value={100} />,
    suffix: "%",
    label: "Non-custodial",
  },
];

function Stats() {
  return (
    <section className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <Sparkles className="mr-1.5 inline h-3 w-3 align-[-1px]" />
            Every claim has a hash you can re-check
          </p>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 70}>
              <div className="flex h-full flex-col items-center gap-2 bg-surface px-5 py-10 text-center">
                <p className="font-display text-5xl font-semibold tracking-[-0.04em] tabular-nums">
                  {s.prefix}
                  {s.value}
                  {s.suffix && (
                    <span className="text-2xl text-muted-foreground">
                      {s.suffix}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 8 · CLOSING CTA (blue band)                                         */
/* ------------------------------------------------------------------ */

function ClosingCTA() {
  return (
    <section className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-20 text-center text-brand-foreground">
            <div
              aria-hidden
              className="absolute inset-0 dot-bg opacity-[0.12] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance font-display text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
                Your next invoice can be a link.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-pretty text-brand-foreground/80">
                Create one in under a minute. It settles on Arc, in USDC, with a
                receipt you can both verify.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  asChild
                  className="group bg-background text-foreground hover:bg-background/90"
                >
                  <Link href="/create">
                    Create a payment link
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  asChild
                  className="text-brand-foreground hover:bg-white/10 hover:text-brand-foreground"
                >
                  <Link href={`/receipt/${EXAMPLE_RECEIPT}`}>
                    See a live receipt
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
