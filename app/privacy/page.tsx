import type { Metadata } from "next";
import { MarketingNav, MarketingFooter } from "@/components/onelink/nav";
import { Reveal } from "@/components/onelink/reveal";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What OneLink stores and what stays public on Arc.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background page-in">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Privacy
          </p>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-[-0.035em] md:text-[52px]">
            Public payment links require deliberate sharing.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            OneLink stores the minimum needed to render a public receipt. On-
            chain transactions are inherently public on Arc. Anything beyond
            that is opt-in.
          </p>
        </Reveal>

        <Section title="What we store">
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>· Slug, amount, memo, recipient wallet, optional expiry.</li>
            <li>· Verified Arc transaction hash for paid and cancelled links.</li>
            <li>· Optional freelancer profile handle, display name, and bio.</li>
            <li>· Wallet addresses you intentionally connect via your wallet app.</li>
          </ul>
        </Section>

        <Section title="What is on-chain">
          <p>
            Link creation, payment, and cancellation events are recorded by the
            OneLinkCollect contract on Arc Testnet. Anyone can read those events
            on Arcscan. A receipt link is a public URL.
          </p>
        </Section>

        <Section title="What we do not collect">
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>· No legal name, government ID, email, or phone number.</li>
            <li>· No advertising or third-party analytics SDKs.</li>
            <li>· No private keys, seed phrases, or wallet credentials.</li>
          </ul>
        </Section>

        <Section title="Sharing">
          <p>
            Anyone with a OneLink URL can view the link or receipt. Treat the
            URL as the access token — share it carefully.
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
