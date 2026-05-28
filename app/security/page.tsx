import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/components/onelink/nav";
import { Reveal } from "@/components/onelink/reveal";

export const metadata: Metadata = {
  title: "Security",
  description: "How OneLink verifies payment state, what is in scope, and what is not.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background page-in">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Trust center
          </p>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-[-0.035em] md:text-[52px]">
            Verification before claims.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            OneLink is a real Arc Testnet payment product. Its public language
            is deliberately limited to routes and outcomes that have completed
            live settlement tests.
          </p>
        </Reveal>

        <Section title="What has been proven live">
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>· Direct USDC payment on Arc Testnet through the deployed checkout.</li>
            <li>
              · WalletConnect QR pairing and signed Arc Testnet payment through a
              compatible WalletConnect peer.
            </li>
            <li>· Permanent freelancer profile payment with a persisted receipt.</li>
            <li>
              · Base Sepolia to Arc Testnet bridge checkout through Circle App
              Kit and CCTP.
            </li>
            <li>· Creator cancellation verified by Arc event before final state.</li>
          </ul>
        </Section>

        <Section title="How payment state is protected">
          <p>
            A standard invoice is registered in shared storage only after the
            server verifies its Arc{" "}
            <span className="font-mono">PaymentLinkCreated</span> event,
            payment terms, and URL-derived link identifier. A single on-chain
            invoice cannot be replayed into multiple dashboard rows.
          </p>
          <p>
            The browser cannot mark a Supabase-backed payment as paid or
            cancelled. Server routes verify the corresponding Arc settlement
            or creator-cancellation event before writing either final state.
          </p>
          <p>
            Receipts expose the Arcscan settlement transaction so a payer or
            recipient can independently inspect the on-chain result.
          </p>
        </Section>

        <Section title="Why USDC is the gas token on Arc">
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>
              · Arc Testnet uses USDC as native gas. A payer never needs ETH or
              any other token to settle a OneLink invoice.
            </li>
            <li>
              · The same USDC the payer is sending also covers the transaction
              fee, so the wallet only needs one balance to complete the flow.
            </li>
            <li>
              · Sub-second deterministic finality on Arc means the receipt
              page reflects on-chain settlement almost as fast as the wallet
              confirms.
            </li>
            <li>
              · Arcscan is the public source of truth. Every paid OneLink
              receipt links to the exact Arc transaction that moved the USDC.
            </li>
          </ul>
        </Section>

        <Section title="Scope and limitations">
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>
              · This deployment operates on testnets and uses testnet USDC
              only. It is not a mainnet payment service.
            </li>
            <li>
              · Base Sepolia is the live-proven bridge source. Displayed beta
              sources are not represented as launch-proven routes.
            </li>
            <li>
              · Circle Gateway unified-balance checkout is disabled until its
              funded flow is separately verified.
            </li>
            <li>
              · OneLink does not support cards, fiat transfer, Solana, or
              automatic payment from arbitrary wallet funds.
            </li>
          </ul>
        </Section>

        <Section title="User safety">
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>· Confirm the recipient, amount, network, and route in the checkout before signing.</li>
            <li>· Do not send mainnet funds or production credentials to this testnet deployment.</li>
            <li>
              · Use the linked Arcscan receipt as the source of truth for a
              completed testnet settlement.
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
