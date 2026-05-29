import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/components/onelink/nav";
import { Reveal } from "@/components/onelink/reveal";

export const metadata: Metadata = {
  title: "Terms",
  description: "Plain-language terms covering OneLink's testnet scope and limitations.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background page-in">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Terms of use
          </p>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-[-0.035em] md:text-[52px]">
            Testnet software, not a financial service.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            OneLink Collect is open-source software for Arc Testnet only. Using
            it does not create a payments-provider relationship. Read these
            terms before signing transactions.
          </p>
        </Reveal>

        <Section title="Testnet only">
          <p>
            All transactions occur on Arc Testnet. USDC referenced by OneLink
            is testnet USDC. Do not send mainnet funds or treat any receipt as
            settlement of a real-world obligation unless both parties
            explicitly agree.
          </p>
        </Section>

        <Section title="Self-custody">
          <p>
            OneLink never holds your keys. Wallet connections happen through
            standard browser extensions and WalletConnect. Anything signed by
            your wallet is your responsibility.
          </p>
        </Section>

        <Section title="No warranty">
          <p>
            The software is provided as-is under the MIT license. There is no
            warranty of fitness for any particular purpose, no guarantee of
            uptime, and no obligation to recover lost or misrouted funds.
          </p>
        </Section>

        <Section title="Compliance">
          <p>
            OneLink does not implement KYC, AML, sanctions screening, or
            jurisdiction filtering. Users are responsible for compliance with
            local law.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            These terms can change without notice. Continued use of OneLink
            constitutes acceptance of the most recent version.
          </p>
        </Section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="mt-14 border-t border-hairline pt-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-4 space-y-3 text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </Reveal>
  );
}
