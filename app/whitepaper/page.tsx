import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/components/onelink/nav";
import { Reveal } from "@/components/onelink/reveal";
import { ARC_CHAIN_ID, ARC_USDC_ADDRESS, ARC_EXPLORER_URL } from "@/lib/arc";
import { ONELINK_CONTRACT_ADDRESS } from "@/lib/contracts";

export const metadata: Metadata = {
  title: "Whitepaper",
  description:
    "OneLink Collect — product thesis, settlement architecture, supported routes, and verified launch scope.",
};

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-background page-in">
      <MarketingNav />

      <main className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Whitepaper · v1
          </p>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-[-0.035em] md:text-[56px] md:leading-[1.08]">
            One link for USDC payments.
            <br />
            Verified on Arc.
          </h1>
          <p className="mt-7 text-lg leading-relaxed text-muted-foreground">
            OneLink Collect is a testnet payment-link product for freelancers,
            creators, and Web3 teams. A creator publishes one shareable link or
            a permanent profile handle. A payer opens it, picks a supported
            USDC route, signs a wallet transaction, and the server records
            final state only after Arc Testnet on-chain verification.
          </p>
        </Reveal>

        <Section title="The problem">
          <p>
            Stablecoin payments are global, but the freelancer checkout
            experience is fragmented. Today freelancers send their wallet
            address, the client asks which chain, both stress about gas tokens,
            and proof of payment is a screenshot.
          </p>
          <p>
            Crypto-native payments deserve a Stripe-grade interface. OneLink
            replaces address dance with a single shareable URL backed by an
            Arc-verified receipt.
          </p>
        </Section>

        <Section title="Settlement model">
          <p>
            Every standard invoice is registered on Arc via{" "}
            <span className="font-mono text-foreground">createLink()</span> on
            the deployed <span className="font-mono">OneLinkCollect</span>{" "}
            contract. The server verifies the on-chain{" "}
            <span className="font-mono">PaymentLinkCreated</span> event before
            persisting metadata in Supabase.
          </p>
          <p>
            Final paid and cancelled state transitions are server-only. The
            browser cannot mark a payment paid; the API verifies the matching{" "}
            <span className="font-mono">PaymentCompleted</span> or{" "}
            <span className="font-mono">PaymentLinkCancelled</span> event on Arc
            and writes through the immutability trigger in Supabase.
          </p>
          <p>
            Receipts at <span className="font-mono">/receipt/[id]</span> expose
            the verified Arcscan transaction as the source of truth for any
            reviewer.
          </p>
        </Section>

        <Section title="Payment routes">
          <ul className="space-y-4 text-base text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">
                Arc-direct
              </strong>{" "}
              — payer holds USDC on Arc Testnet. Two transactions: approve plus{" "}
              <span className="font-mono">payLink(linkId)</span>.
            </li>
            <li>
              <strong className="font-medium text-foreground">
                Bridge via Circle CCTP
              </strong>{" "}
              — payer holds USDC on Base Sepolia. Circle App Kit orchestrates
              approve, burn, attestation, and mint. After mint, the standard
              Arc-direct settlement runs.
            </li>
            <li>
              <strong className="font-medium text-foreground">
                Circle Gateway unified balance
              </strong>{" "}
              — implemented end-to-end but gated. Disabled in checkout until a
              funded deposit, burn, and mint flow is proven.
            </li>
          </ul>
        </Section>

        <Section title="Architecture">
          <p>
            Next.js 15 App Router with React 19 and TypeScript on the frontend.
            Wallet connectivity through wagmi, viem, RainbowKit, and
            WalletConnect/Reown. Bridge and Gateway flows run through{" "}
            <span className="font-mono">@circle-fin/app-kit</span> with the
            viem v2 adapter.
          </p>
          <p>
            The OneLinkCollect Solidity contract is deployed on Arc Testnet
            (chain id <span className="font-mono">{ARC_CHAIN_ID}</span>). Tests
            are written in Foundry; 27 tests cover the contract today.
          </p>
          <p>
            Off-chain metadata lives in Supabase with row-level security and an
            immutability trigger that locks terminal states. The app falls back
            to localStorage in demo mode when env vars are missing — demo
            receipts are visibly marked.
          </p>
        </Section>

        <Section title="Why USDC is the gas token on Arc">
          <ul className="space-y-3 text-base text-muted-foreground">
            <li>
              No ETH-for-gas friction. The same USDC the payer is sending also
              covers the transaction fee.
            </li>
            <li>
              Sub-second deterministic finality on Arc — receipt pages reflect
              on-chain settlement almost as fast as the wallet confirms.
            </li>
            <li>
              Predictable testnet fees. No spikes during congestion that would
              break a freelancer&apos;s expected cost basis.
            </li>
          </ul>
        </Section>

        <Section title="Verified scope and what we do not claim">
          <p className="font-medium text-foreground">Live-proven on Arc Testnet:</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>· Arc-direct payment flow.</li>
            <li>· Browser-wallet end-to-end (create, approve, pay, refresh, receipt).</li>
            <li>· WalletConnect QR pairing and signed Arc payment.</li>
            <li>· Base Sepolia → Arc bridge through Circle App Kit and CCTP.</li>
            <li>· Permanent freelancer profile handle and payer-initiated profile payment.</li>
            <li>· Server-verified creator cancellation.</li>
            <li>· Failure-state recovery (rejected wallet, expired link, cancelled link).</li>
          </ul>
          <p className="mt-6 font-medium text-foreground">Not claimed:</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>· Mainnet readiness or live mainnet payments.</li>
            <li>· Solana support.</li>
            <li>· Fiat or card rails.</li>
            <li>· Any-chain instant settlement.</li>
            <li>· Gateway proven end-to-end (gated until funded proof).</li>
          </ul>
        </Section>

        <Section title="Reference">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="font-mono uppercase tracking-[0.16em]">Chain</span>
              <span className="ml-3 font-mono">Arc Testnet · {ARC_CHAIN_ID}</span>
            </li>
            <li>
              <span className="font-mono uppercase tracking-[0.16em]">USDC</span>
              <span className="ml-3 font-mono">{ARC_USDC_ADDRESS}</span>
            </li>
            <li>
              <span className="font-mono uppercase tracking-[0.16em]">Contract</span>
              <span className="ml-3 font-mono">{ONELINK_CONTRACT_ADDRESS}</span>
            </li>
            <li>
              <span className="font-mono uppercase tracking-[0.16em]">Explorer</span>
              <a
                href={ARC_EXPLORER_URL}
                target="_blank"
                rel="noreferrer"
                className="ml-3 font-mono underline-offset-2 hover:underline"
              >
                {ARC_EXPLORER_URL}
              </a>
            </li>
          </ul>
        </Section>
      </main>

      <MarketingFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="mt-16 border-t border-hairline pt-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </Reveal>
  );
}
