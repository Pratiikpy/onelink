"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Copy } from "lucide-react";

import { MarketingNav, MarketingFooter } from "@/components/onelink/nav";
import { Reveal } from "@/components/onelink/reveal";
import { Button } from "@/components/ui/button";
import {
  ARC_CHAIN_ID,
  ARC_EXPLORER_URL,
  ARC_USDC_ADDRESS,
  explorerTx,
} from "@/lib/arc";
import { HAS_CONTRACT, ONELINK_CONTRACT_ADDRESS } from "@/lib/contracts";
import { cn } from "@/lib/utils";

// ── Real, provable values (accuracy map / WHITEPAPER.md) ───────────────────
const REAL_CONTRACT = "0x9b7D5B4DAD4c9B1065908FA8C6C34d697E3cBD0c";
// The deployed address is the real one shipped to Arc Testnet. When the build
// is wired to the contract env we surface the env value; otherwise we still
// show the genuine deployed address (this page documents the live deployment).
const CONTRACT_ADDRESS = HAS_CONTRACT ? ONELINK_CONTRACT_ADDRESS : REAL_CONTRACT;

const SECTIONS = [
  { id: "abstract", n: "01", title: "Abstract" },
  { id: "settlement-before-status", n: "02", title: "Settlement before status" },
  { id: "architecture", n: "03", title: "System architecture" },
  { id: "contract", n: "04", title: "The OneLinkCollect contract" },
  { id: "verification", n: "05", title: "Server-verified settlement" },
  { id: "routes", n: "06", title: "Payment routes" },
  { id: "arc", n: "07", title: "Arc integration" },
  { id: "circle", n: "08", title: "Circle integration" },
  { id: "data-identity", n: "09", title: "Data & identity" },
  { id: "security", n: "10", title: "Security model" },
  { id: "scope", n: "11", title: "Verified scope & limits" },
  { id: "proofs", n: "12", title: "On-chain proofs" },
] as const;

// Real Arc Testnet transaction proofs (accuracy map). Each links to Arcscan.
const PROOFS = [
  {
    label: "Direct Arc payment",
    hash: "0x508ebf9ac99613534e82d768d423c0d30c274c57d30f0181c9cba6805e5ddd46",
  },
  {
    label: "Verified cancellation",
    hash: "0x9a7d08580a5313cb97220c21e2011d6f042cc0c6db0349d75a4cafc46bdc5138",
  },
  {
    label: "Permanent profile payment",
    hash: "0xe6521e60bd25a01a82124ec22a368c9200480081b2708ffadcce23779aed0fea",
  },
  {
    label: "WalletConnect signed payment",
    hash: "0x2f5abeb1840cd6ed905cb3af6d72e7de7c6ad44c84a30050a79605eceea48daa",
  },
  {
    label: "Browser-wallet end-to-end",
    hash: "0x031e671e9321e60310276af91a1bb3b52c8079be86a824bc0378edd98a67a889",
  },
  {
    label: "Base → Arc bridge settlement",
    hash: "0x06907a47b9c79da2164efcd5fe9f58fe708969fee27af4563c3b232c860911ad",
  },
] as const;

export default function WhitepaperPage() {
  const activeId = useScrollSpy(SECTIONS.map((s) => s.id));

  return (
    <div className="min-h-screen bg-background page-in">
      <MarketingNav />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-20">
          <Reveal>
            <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-hairline bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
              Server-verified on Arc
              <span className="text-hairline">·</span>
              <span className="text-foreground">Arc Testnet</span>
              <span className="text-hairline">·</span>
              Chain {ARC_CHAIN_ID}
            </span>
          </Reveal>
          <Reveal delay={70}>
            <h1 className="mt-7 max-w-3xl text-balance font-display text-4xl font-semibold tracking-[-0.035em] md:text-[60px] md:leading-[1.04]">
              Settlement before <span className="text-brand">status</span>.
            </h1>
          </Reveal>
          <Reveal delay={130}>
            <p className="mt-6 max-w-2xl text-pretty text-[17px] leading-relaxed text-muted-foreground">
              A payment is only trustworthy if its{" "}
              <span className="font-mono text-foreground">paid</span> state
              corresponds to a real on-chain settlement. OneLink Collect enforces
              one principle — a server decodes and matches the event emitted by
              the <span className="font-mono text-foreground">OneLinkCollect</span>{" "}
              contract before it writes any final record. The client can request a
              state change; only the chain can justify it. Every receipt anchors
              to a verifiable Arc transaction.
            </p>
          </Reveal>

          {/* Copyable reference chips */}
          <Reveal delay={190}>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <RefChip
                label="Settlement contract"
                value={CONTRACT_ADDRESS}
                href={`${ARC_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
              />
              <RefChip
                label="USDC (ERC-20)"
                value={ARC_USDC_ADDRESS}
                accent="usdc"
              />
              <RefChip label="Chain ID" value={String(ARC_CHAIN_ID)} mono />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Body: sticky contents + sections ─────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="md:grid md:grid-cols-[210px_1fr] md:gap-14 lg:gap-20">
          {/* Sticky contents nav */}
          <aside className="hidden md:block">
            <div className="sticky top-24">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Contents
              </p>
              <nav className="mt-5 space-y-0.5">
                {SECTIONS.map((s) => {
                  const active = activeId === s.id;
                  return (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className={cn(
                        "group flex items-baseline gap-2.5 rounded-md px-2 py-1.5 text-[13px] leading-snug transition-colors",
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "font-mono text-[10px] tabular-nums transition-colors",
                          active
                            ? "text-brand"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      >
                        {s.n}
                      </span>
                      <span className="text-balance">{s.title}</span>
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Sections */}
          <article className="min-w-0 max-w-2xl">
            <Section id="abstract" n="01" title="Abstract">
              <p>
                A payment is only trustworthy if its{" "}
                <Mono>paid</Mono> state corresponds to a real on-chain
                settlement. OneLink enforces this with a single principle —{" "}
                <strong className="font-medium text-foreground">
                  settlement before status
                </strong>{" "}
                — implemented as a server that decodes and matches the on-chain
                event emitted by the <Mono>OneLinkCollect</Mono> contract before
                it writes a <Mono>paid</Mono> (or <Mono>cancelled</Mono>) record.
              </p>
              <p>
                The client can request a state change; only the chain can justify
                it. Every receipt therefore anchors to a verifiable Arc
                transaction, and every claim on this page maps to a hash you can
                re-check on Arcscan.
              </p>
            </Section>

            <Section
              id="settlement-before-status"
              n="02"
              title="Settlement before status"
            >
              <p>The design principle holds across the whole product:</p>
              <BulletList
                items={[
                  "The front-end never self-certifies a payment.",
                  <>
                    An API route under <Mono>/api/payments/*</Mono> fetches the
                    transaction receipt from Arc,{" "}
                    <Mono>decodeEventLog</Mono>s it against the contract ABI, and
                    confirms the event arguments match the link&apos;s expected
                    values <em>before</em> persisting.
                  </>,
                  "This holds for three transitions: invoice creation, final paid, and final cancelled.",
                ]}
              />
              <Callout>
                There is no code path in which the UI alone can fabricate a
                settlement.
              </Callout>
            </Section>

            <Section id="architecture" n="03" title="System architecture">
              <p>
                Four layers, with the contract — not the browser — as the source
                of truth.
              </p>
              <CodeBlock>{`Creator wallet ──signs createLink──▶ Arc (OneLinkCollect)
        │                                 │ emits PaymentLinkCreated
        ▼                                 ▼
  /api/payments/create ──verifies──▶ Supabase (payment_links)
        │                                 [demo mode → localStorage]
Payer wallet ──approve + payLink / bridge+settle──▶ Arc
        │                                 │ emits PaymentCompleted
        ▼                                 ▼
  /api/payments/reconcile ──verifies──▶ status = paid
        │
        ▼
  /receipt/[id] ── renders the verified Arcscan tx`}</CodeBlock>
              <BulletList
                items={[
                  <>
                    <Term>Client</Term> — Next.js 15 App Router, React 19. Server
                    components by default; wallet flows are client components on
                    wagmi/viem/RainbowKit.
                  </>,
                  <>
                    <Term>Settlement</Term> — the <Mono>OneLinkCollect</Mono>{" "}
                    contract on Arc Testnet holds authoritative link state and
                    emits the events the server verifies.
                  </>,
                  <>
                    <Term>Verification &amp; persistence</Term> — Vercel
                    serverless API routes verify events and write state with a
                    service-role client; RLS prevents unauthenticated tampering.
                  </>,
                  <>
                    <Term>Demo mode</Term> — with no contract or Supabase
                    configured, the app runs from <Mono>localStorage</Mono> with{" "}
                    <Mono>0xDEM0…</Mono> pseudo-hashes, explicitly labeled and
                    never used in production.
                  </>,
                ]}
              />
            </Section>

            <Section id="contract" n="04" title="The OneLinkCollect contract">
              <p>
                Solidity <Mono>^0.8.28</Mono> (MIT), built and tested with Foundry
                (<Mono>optimizer_runs 200</Mono>), settling USDC via{" "}
                <Mono>IERC20.transferFrom</Mono>.
              </p>

              <SubHead>Functions</SubHead>
              <DefList
                rows={[
                  [
                    "createLink(linkId, recipient, amount, expiresAt)",
                    "Register an invoice link.",
                  ],
                  ["payLink(linkId)", "Pay a registered invoice link."],
                  [
                    "payRecipient(paymentId, recipient, amount)",
                    "Profile (handle) payment to a recipient.",
                  ],
                  ["cancelLink(linkId)", "Creator-only cancellation of an open link."],
                  ["getLink(linkId) view", "Read link state."],
                ]}
              />

              <SubHead>Events the server verifies</SubHead>
              <BulletList
                items={[
                  <Mono key="a">
                    PaymentLinkCreated(linkId, creator, recipient, amount,
                    expiresAt)
                  </Mono>,
                  <Mono key="b">
                    PaymentCompleted(linkId, payer, recipient, grossAmount,
                    feeAmount)
                  </Mono>,
                  <Mono key="c">PaymentLinkCancelled(linkId, creator)</Mono>,
                ]}
              />

              <SubHead>Fee model (hard-capped)</SubHead>
              <BulletList
                items={[
                  <>
                    <Mono>feeBps</Mono> is bounded — the constructor and{" "}
                    <Mono>setFeeConfig</Mono> revert <Mono>FeeTooHigh</Mono> if{" "}
                    <Mono>feeBps &gt; 100</Mono>, a protocol-enforced{" "}
                    <strong className="font-medium text-foreground">
                      1% maximum (≤100 bps)
                    </strong>
                    .
                  </>,
                  <>
                    Fee math: <Mono>feeAmount = (amount * feeBps) / 10_000</Mono>,
                    deducted at settlement. <Mono>PaymentCompleted</Mono> carries
                    both <Mono>grossAmount</Mono> and <Mono>feeAmount</Mono>.
                  </>,
                ]}
              />

              <div className="mt-6 flex flex-wrap gap-2.5">
                <StatPill k="27 / 27" v="Foundry tests pass" />
                <StatPill k="≤ 1%" v="fee, capped on-chain" />
                <StatPill k="11" v="custom-error invariants" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground/90">
                Invariants enforce unique link ids, creator-only cancellation, no
                double-pay, expiry handling, valid recipient/amount, the fee cap,
                and a checked token transfer (<Mono>NotCreator</Mono>,{" "}
                <Mono>LinkAlreadyPaid</Mono>, <Mono>FeeTooHigh</Mono>,{" "}
                <Mono>TransferFailed</Mono>, and others). Link identity is{" "}
                <Mono>keccak256(&quot;onelink:&quot; + slug)</Mono>, re-derived
                and matched server-side so a forged invoice cannot be persisted.
              </p>
            </Section>

            <Section id="verification" n="05" title="Server-verified settlement model">
              <p>
                <Mono>/api/payments/create</Mono> is representative of the
                verify-then-write pattern used by every money-touching route:
              </p>
              <ol className="mt-5 space-y-3">
                {[
                  <>
                    Require <Mono>HAS_CONTRACT</Mono> + Supabase env, else return{" "}
                    <Mono>503</Mono> (demo mode handles this client-side via{" "}
                    <Mono>localStorage</Mono>).
                  </>,
                  <>
                    Build a viem{" "}
                    <Mono>createPublicClient(&#123; transport: http(ARC_RPC_URL) &#125;)</Mono>
                    .
                  </>,
                  <>
                    Fetch the submitted transaction receipt and{" "}
                    <Mono>decodeEventLog</Mono> it against{" "}
                    <Mono>oneLinkCollectAbi</Mono>.
                  </>,
                  <>
                    Match the decoded <Mono>PaymentLinkCreated</Mono> args against
                    the request and the URL-derived link id.
                  </>,
                  <>
                    Only then upsert into the Supabase{" "}
                    <Mono>payment_links</Mono> table with the service-role client.
                  </>,
                ].map((v, i) => (
                  <li key={i} className="flex items-start gap-3.5">
                    <span className="mt-px grid h-6 w-6 shrink-0 place-items-center rounded-full border border-hairline bg-surface font-mono text-[11px] tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="min-w-0 text-[15px] leading-relaxed text-muted-foreground">
                      {v}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-5">
                <Mono>reconcile</Mono> and <Mono>cancel</Mono> apply the same
                pattern for the final <Mono>paid</Mono> and{" "}
                <Mono>cancelled</Mono> states. All routes are rate-limited (e.g.
                create is 20 requests / 60s) and return generic, non-leaking error
                messages.
              </p>
            </Section>

            <Section id="routes" n="06" title="Payment routes">
              <div className="mt-5 space-y-3">
                <RouteCard
                  status="proven"
                  name="Arc-direct"
                  detail={
                    <>
                      Payer holds USDC on Arc. Two transactions:{" "}
                      <Mono>approve</Mono> then <Mono>payLink(linkId)</Mono>. The
                      server verifies <Mono>PaymentCompleted</Mono> before marking
                      paid.
                    </>
                  }
                />
                <RouteCard
                  status="proven"
                  name="Bridge · Circle CCTP + App Kit"
                  detail={
                    <>
                      Native USDC is burned on the source and minted on Arc, then
                      settled in the same flow — surfacing{" "}
                      <Mono>approve → burn → fetchAttestation → mint</Mono>.{" "}
                      <strong className="font-medium text-foreground">
                        Base Sepolia → Arc
                      </strong>{" "}
                      is live-proven; Ethereum Sepolia, Arbitrum Sepolia, and
                      Polygon Amoy are beta.
                    </>
                  }
                />
                <RouteCard
                  status="gated"
                  name="Unified balance · Circle Gateway"
                  detail={
                    <>
                      Hand-rolled EIP-712 burn-intents against the Gateway API.
                      Implemented end-to-end but{" "}
                      <strong className="font-medium text-foreground">gated</strong>{" "}
                      behind <Mono>NEXT_PUBLIC_ENABLE_GATEWAY</Mono> — disabled in
                      checkout until a funded deposit/burn/mint flow is proven.
                    </>
                  }
                />
              </div>
            </Section>

            <Section id="arc" n="07" title="Arc integration">
              <p>
                USDC is Arc&apos;s{" "}
                <strong className="font-medium text-foreground">
                  native gas token
                </strong>
                , so a payer never needs ETH — the same USDC being sent also
                covers the fee. Constants live in <Mono>lib/arc.ts</Mono>:
              </p>
              <DefList
                rows={[
                  ["ARC_CHAIN_ID", "5042002"],
                  ["ARC_RPC_URL", "https://rpc.testnet.arc.network"],
                  ["ARC_EXPLORER_URL", "https://testnet.arcscan.app"],
                  [
                    "ARC_USDC_ADDRESS",
                    "0x3600000000000000000000000000000000000000",
                  ],
                  ["USDC_DECIMALS", "6 (ERC-20); native gas is USDC (18 decimals)"],
                ]}
              />
            </Section>

            <Section id="circle" n="08" title="Circle integration">
              <BulletList
                items={[
                  <>
                    <Term>CCTP · App Kit</Term> —{" "}
                    <Mono>lib/circle-payments.ts</Mono> dynamically imports{" "}
                    <Mono>@circle-fin/app-kit</Mono> +{" "}
                    <Mono>@circle-fin/adapter-viem-v2</Mono> and calls{" "}
                    <Mono>kit.bridge(…)</Mono> with{" "}
                    <Mono>to: &#123; chain: &quot;Arc_Testnet&quot; &#125;</Mono>,
                    surfacing live step events for the burn-and-mint.
                  </>,
                  <>
                    <Term>Gateway</Term> — hand-rolled in{" "}
                    <Mono>lib/gateway.ts</Mono> (no SDK): EIP-712 burn-intents (
                    <Mono>domain &#123; name: &quot;GatewayWallet&quot; &#125;</Mono>
                    ) against the testnet Gateway API, Arc destination domain{" "}
                    <Mono>26</Mono>. Gated until a funded proof is run.
                  </>,
                ]}
              />
            </Section>

            <Section id="data-identity" n="09" title="Data & identity">
              <BulletList
                items={[
                  <>
                    <Term>Persistence</Term> — Supabase for cross-device metadata,
                    gated by server-side verification; a{" "}
                    <Mono>localStorage</Mono> fallback powers demo mode.
                    Migrations enforce the same invariants from the database side
                    (anonymous standard-invoice insertion is rejected; unpaid
                    profile rows are hidden from the dashboard) — 0 Supabase
                    security advisor lints.
                  </>,
                  <>
                    <Term>Demo mode</Term> — <Mono>HAS_CONTRACT</Mono> /{" "}
                    <Mono>IS_DEMO_MODE</Mono> derive from the contract env. A
                    production-safety throw blocks silent demo-mode deploys unless{" "}
                    <Mono>NEXT_PUBLIC_ALLOW_DEMO=true</Mono>.
                  </>,
                  <>
                    <Term>Profile claims</Term> — a permanent freelancer handle is
                    claimed with an{" "}
                    <strong className="font-medium text-foreground">
                      EIP-712 typed-data signature
                    </strong>{" "}
                    (domain{" "}
                    <Mono>
                      &#123; name: &quot;OneLink Collect&quot;, chainId: 5042002 &#125;
                    </Mono>
                    , ~600s TTL). The server verifies the signature, binds owner ==
                    recipient, enforces freshness, and is rate-limited, so a
                    captured signature is not trivially replayable.
                  </>,
                ]}
              />
            </Section>

            <Section id="security" n="10" title="Security model">
              <BulletList
                items={[
                  <>
                    <Term>Contract</Term> — capped fee, custom-error invariants,
                    checked transfers, creator-only cancellation, no double-pay;
                    27 passing Foundry tests.
                  </>,
                  <>
                    <Term>Server trust boundary</Term> — final state requires a
                    verified on-chain event; forged anonymous invoice creation and
                    forged cancellation are rejected (proven in QA).
                  </>,
                  <>
                    <Term>API hardening</Term> — per-IP rate limiting on
                    payment/gateway/profile routes; generic error responses with no
                    raw RPC leakage; the Gateway route validates the Arc
                    destination domain.
                  </>,
                  <>
                    <Term>App headers</Term> — <Mono>nosniff</Mono>,{" "}
                    <Mono>X-Frame-Options: DENY</Mono>, a restrictive{" "}
                    <Mono>Permissions-Policy</Mono>, and HSTS with preload.
                  </>,
                  <>
                    <Term>Repository</Term> — CodeQL with{" "}
                    <strong className="font-medium text-foreground">
                      0 open alerts
                    </strong>
                    , secret scanning + push protection, Dependabot, and required
                    status checks on a protected <Mono>main</Mono>.
                  </>,
                  <>
                    <Term>Accessibility</Term> — <Mono>maximumScale: 5</Mono>;
                    pinch-zoom is preserved (WCAG 1.4.4).
                  </>,
                ]}
              />
            </Section>

            <Section id="scope" n="11" title="Verified scope & limits">
              <p className="font-medium text-foreground">
                Proven on the live deployment:
              </p>
              <BulletList
                items={[
                  "Arc-direct payment and browser-wallet end-to-end.",
                  "WalletConnect QR pairing and signed Arc payment.",
                  "Base Sepolia → Arc bridge via Circle CCTP / App Kit.",
                  "Permanent profile handle and payer-initiated profile payment.",
                  "Server-verified creator cancellation and failure-state recovery.",
                  "A 5-viewport visual QA sweep.",
                ]}
              />
              <p className="mt-6 font-medium text-foreground">Not claimed:</p>
              <DefList
                rows={[
                  ["Mainnet", "Not in scope; Arc Testnet only."],
                  ["Solana", "Not implemented."],
                  ["Circle Gateway checkout", "Feature-gated; no funded proof yet."],
                  ["Other bridge sources", "Base Sepolia proven; others beta."],
                  ["Arbitrary-wallet auto-pay", "Not claimed."],
                ]}
              />
            </Section>

            <Section id="proofs" n="12" title="On-chain transaction proofs">
              <p>
                Every claim above has a hash you can re-check. These are real Arc
                Testnet transactions — open any of them on Arcscan.
              </p>
              <div className="mt-5 overflow-hidden rounded-2xl border border-hairline bg-surface">
                {PROOFS.map((p, i) => (
                  <a
                    key={p.hash}
                    href={explorerTx(p.hash)}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted",
                      i !== 0 && "border-t border-hairline",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{p.label}</span>
                      <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">
                        {p.hash}
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </a>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild variant="brand">
                  <Link href="/create">Create a link</Link>
                </Button>
                <Button asChild variant="outline">
                  <a
                    href="https://github.com/Pratiikpy/onelink"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read the source
                  </a>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/receipt/7e41bf18-b61c-4af2-baeb-b10f219d58e8">
                    See a real receipt
                  </Link>
                </Button>
              </div>
            </Section>
          </article>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}

/* ── Scroll spy for the sticky contents nav ──────────────────────────── */
function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  const idsRef = useRef(ids);
  idsRef.current = ids;

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
          else visible.delete(e.target.id);
        }
        // Pick the section closest to the top that's currently visible.
        let best = "";
        for (const id of idsRef.current) {
          if (visible.has(id)) {
            best = id;
            break;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: [0, 0.5, 1] },
    );
    const els = idsRef.current
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return active;
}

/* ── Copyable reference chip (hero) ──────────────────────────────────── */
function RefChip({
  label,
  value,
  href,
  accent,
  mono,
}: {
  label: string;
  value: string;
  href?: string;
  accent?: "usdc";
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard?.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable — chip is still readable */
    }
  }

  return (
    <div className="group rounded-xl border border-hairline bg-surface/80 p-3.5 backdrop-blur-sm transition-colors hover:bg-surface">
      <div className="flex items-center gap-2">
        {accent === "usdc" && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-usdc" aria-hidden />
        )}
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <code
          className={cn(
            "min-w-0 flex-1 break-all font-mono text-[12px] leading-snug text-foreground",
            mono && "text-sm tabular-nums",
          )}
        >
          {value}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : `Copy ${label}`}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-hairline bg-background text-muted-foreground transition-colors hover:text-foreground active:scale-[0.96] motion-reduce:active:scale-100"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-brand"
        >
          View on Arcscan
          <ArrowUpRight className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

/* ── Section primitives ──────────────────────────────────────────────── */
function Section({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-hairline pt-10 first:border-t-0 first:pt-0 [&+section]:mt-14"
    >
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] tabular-nums text-brand">{n}</span>
          <h2 className="font-display text-[26px] font-semibold tracking-[-0.025em] md:text-3xl">
            {title}
          </h2>
        </div>
        <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground [&_strong]:text-foreground">
          {children}
        </div>
      </Reveal>
    </section>
  );
}

function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <p className="!mt-7 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
      {children}
    </p>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </span>
  );
}

function Term({ children }: { children: React.ReactNode }) {
  return <strong className="font-medium text-foreground">{children}</strong>;
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-brand/60" />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DefList({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="overflow-hidden rounded-xl border border-hairline bg-surface">
      {rows.map(([k, v], i) => (
        <div
          key={k}
          className={cn(
            "grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] sm:gap-4",
            i !== 0 && "border-t border-hairline",
          )}
        >
          <dt className="break-words font-mono text-[12px] text-foreground">{k}</dt>
          <dd className="break-words text-[13px] text-muted-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-hairline bg-card p-4 font-mono text-[11.5px] leading-relaxed text-muted-foreground">
      <code>{children}</code>
    </pre>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <p className="!mt-5 rounded-xl border border-brand/25 bg-brand-tint px-4 py-3 text-[15px] font-medium text-brand-text">
      {children}
    </p>
  );
}

function StatPill({ k, v }: { k: string; v: string }) {
  return (
    <span className="inline-flex items-baseline gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5">
      <span className="font-display text-sm font-semibold tabular-nums text-foreground">
        {k}
      </span>
      <span className="text-[12px] text-muted-foreground">{v}</span>
    </span>
  );
}

function RouteCard({
  status,
  name,
  detail,
}: {
  status: "proven" | "gated";
  name: string;
  detail: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-[17px] font-semibold tracking-[-0.01em] text-foreground">
          {name}
        </h3>
        {status === "proven" ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Live-proven
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-hairline bg-muted px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Gated
          </span>
        )}
      </div>
      <p className="mt-2.5 text-[14px] leading-relaxed text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}
