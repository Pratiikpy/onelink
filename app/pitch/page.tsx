import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, Code2, Globe2, Link2, ReceiptText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "OneLink Pitch Deck",
  description:
    "A four-slide pitch deck for OneLink: the USDC payment page for freelancers with verified Arc Testnet settlement.",
};

const proofBadges = ["Live Arc proof", "WalletConnect", "Circle CCTP", "Green CI", "0 open alerts"];

const problemBubbles = [
  ["Client", "Which chain should I send on?"],
  ["Freelancer", "Base works, but use native USDC."],
  ["Client", "Is this the same as ERC-20?"],
  ["Freelancer", "Let me send another address."],
];

const stack = [
  ["Arc Testnet", "USDC-first settlement surface with Arcscan receipt proof."],
  ["Circle CCTP", "Live-proven Base Sepolia to Arc USDC route."],
  ["WalletConnect", "QR-based wallet signing flow proven end to end."],
  ["Supabase", "Server-verified payment state and profile storage."],
  ["CodeQL + CI", "Protected repository with zero open alerts."],
];

const icps = [
  ["Web3 freelancers", "Already paid in USDC, but still explaining routes and wallets."],
  ["Consultants", "Need professional invoices for global clients without bank delays."],
  ["Creators", "Sell audits, templates, and services with a shareable payment page."],
  ["Small agencies", "Need project payment links with receipt proof clients can trust."],
];

function DeckShell({
  number,
  label,
  title,
  subtitle,
  children,
}: {
  number: string;
  label: string;
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative min-h-[820px] overflow-hidden rounded-[34px] border border-white/10 bg-[#070809] p-7 shadow-[0_36px_120px_rgba(0,0,0,0.36)] sm:p-10 lg:p-14">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="pointer-events-none absolute right-[-18%] top-[-20%] size-[620px] rounded-full bg-lime/10 blur-[90px]" />
      <div className="relative grid min-h-[690px] gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(380px,0.78fr)] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="mono-label text-[12px] text-lime">{number} - {label}</span>
            <span className="h-px w-12 bg-lime" />
          </div>
          <h2 className="mt-8 max-w-[760px] text-balance text-[52px] font-medium leading-[0.96] tracking-[-0.055em] sm:text-[78px] lg:text-[88px]">
            {title}
          </h2>
          <p className="mt-7 max-w-[680px] text-[19px] leading-8 text-white/58 sm:text-[25px] sm:leading-9">
            {subtitle}
          </p>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

function PaymentMock() {
  return (
    <div className="relative mx-auto max-w-[430px]">
      <div className="absolute -right-8 -top-10 h-[220px] w-[330px] rotate-3 rounded-[28px] border border-white/10 bg-white/[0.035]" />
      <div className="relative rounded-[30px] border border-white/12 bg-[#111215] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.42)]">
        <div className="flex items-center justify-between">
          <span className="mono-label text-[11px]">Payment request</span>
          <span className="rounded-full border border-lime/25 bg-lime/10 px-3 py-1 text-[12px] font-semibold text-lime">
            Arc Testnet
          </span>
        </div>
        <p className="mt-12 text-[78px] leading-none tracking-[-0.06em]">250.00</p>
        <p className="mt-2 text-[22px] text-white/45">USDC</p>
        <div className="mt-8 rounded-[18px] border border-white/10 bg-white/[0.04] p-5">
          <p className="mono-label text-[10px]">Route</p>
          <p className="mt-2 text-[20px] font-medium">Base Sepolia to Arc</p>
        </div>
        <div className="mt-5 rounded-[18px] bg-lime py-5 text-center text-[20px] font-medium text-ink">
          Connect wallet and pay
        </div>
      </div>
      <div className="relative ml-auto mt-5 w-[330px] rounded-[24px] border border-lime/25 bg-lime/[0.07] p-5">
        <div className="flex items-center gap-3 text-lime">
          <BadgeCheck className="size-5" />
          <span className="text-[18px] font-medium">Payment verified</span>
        </div>
        <p className="mt-4 font-mono text-[13px] text-white/38">0x9115...140b</p>
        <p className="mt-2 text-[16px] text-white/56">Receipt backed by Arc proof.</p>
      </div>
    </div>
  );
}

export default function PitchPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1440px]">
        <section className="relative overflow-hidden rounded-[38px] border border-lime/20 bg-lime/[0.045] p-7 sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute right-[-10%] top-[-60%] size-[620px] rounded-full bg-lime/20 blur-[110px]" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_360px] lg:items-end">
            <div>
              <p className="mono-label text-[12px] text-lime">OpenAI x Outskill pitch deck</p>
              <h1 className="mt-7 max-w-[920px] text-balance text-[58px] font-medium leading-[0.92] tracking-[-0.055em] sm:text-[92px] lg:text-[118px]">
                OneLink pitch deck.
              </h1>
              <p className="mt-7 max-w-[780px] text-[20px] leading-8 text-white/62 sm:text-[27px] sm:leading-9">
                A four-slide, judge-ready story for one USDC payment page: problem, solution,
                tech stack, and ideal customer profile.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-[#090a0b] p-6">
              <p className="mono-label text-[11px]">Deck scope</p>
              <div className="mt-6 grid gap-3">
                {proofBadges.map((badge) => (
                  <div key={badge} className="flex items-center gap-3 text-[17px] text-white/76">
                    <span className="size-2 rounded-full bg-lime" />
                    {badge}
                  </div>
                ))}
              </div>
              <Link href="/whitepaper" className="mt-8 inline-flex items-center gap-2 text-[16px] font-medium text-lime">
                Technical whitepaper <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6">
          <DeckShell
            number="01"
            label="Problem"
            title={<>Freelancer payments break at the chain step.</>}
            subtitle="Stablecoins are global, but the checkout experience is still fragmented. The moment a client pays in USDC, the conversation turns into wallet and network support."
          >
            <div className="grid gap-4">
              {problemBubbles.map(([who, text], index) => (
                <div
                  key={text}
                  className={`max-w-[380px] rounded-[22px] border border-white/10 bg-white/[0.055] p-5 ${
                    index % 2 ? "ml-auto" : ""
                  }`}
                >
                  <p className="mono-label text-[10px]">{who}</p>
              <p className="mt-2 text-[21px] leading-7 text-white/72">&quot;{text}&quot;</p>
                </div>
              ))}
              <div className="mt-4 rounded-[24px] border border-dashed border-white/14 p-6 text-[19px] leading-7 text-white/42">
                No professional crypto payment page exists for this client conversation.
              </div>
            </div>
          </DeckShell>

          <DeckShell
            number="02"
            label="Solution"
            title={<>One payment page. Supported routes. Verified receipt.</>}
            subtitle="OneLink gives freelancers a shareable profile or invoice link. Clients review, connect, pay through a supported USDC route, and receive a verified Arc receipt."
          >
            <PaymentMock />
          </DeckShell>

          <DeckShell
            number="03"
            label="Tech stack"
            title={<>Built on Arc and Circle. Tested like a payment product.</>}
            subtitle="The product is not a static mockup. Final payment state is written only after server-side verification of the relevant onchain proof."
          >
            <div className="grid gap-3">
              {stack.map(([title, copy]) => (
                <div key={title} className="rounded-[22px] border border-white/10 bg-white/[0.045] p-5">
                  <div className="flex items-center gap-3">
                    <Code2 className="size-5 text-lime" />
                    <p className="text-[22px] font-medium tracking-tight">{title}</p>
                  </div>
                  <p className="mt-3 text-[16px] leading-6 text-white/54">{copy}</p>
                </div>
              ))}
            </div>
          </DeckShell>

          <DeckShell
            number="04"
            label="ICP"
            title={<>For freelancers who want crypto payments to feel professional.</>}
            subtitle="Start with Web3-native freelancers accepting USDC today, then expand to global service providers who need stablecoin payments without chain confusion."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {icps.map(([title, copy], index) => {
                const Icon = [Globe2, BriefcaseBusiness, Link2, ReceiptText][index];
                return (
                  <article key={title} className="rounded-[22px] border border-white/10 bg-white/[0.045] p-5">
                    <Icon className="size-5 text-lime" />
                    <h3 className="mt-8 text-[23px] font-medium tracking-tight">{title}</h3>
                    <p className="mt-3 text-[16px] leading-6 text-white/54">{copy}</p>
                  </article>
                );
              })}
            </div>
            <div className="mt-4 rounded-[22px] border border-lime/25 bg-lime/[0.08] p-5 text-[22px] font-medium leading-7 text-lime">
              From wallet chaos to one professional payment page.
            </div>
          </DeckShell>
        </div>

        <section className="mt-6 rounded-[32px] border border-white/10 bg-[#111215] p-7 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mono-label text-[12px]">Safe final positioning</p>
              <h2 className="mt-4 max-w-4xl text-[38px] font-medium leading-[1.04] tracking-[-0.045em] sm:text-[56px]">
                OneLink is one payment page for supported USDC routes, verified on Arc Testnet.
              </h2>
            </div>
            <Link
              href="/create"
              className="inline-flex h-16 shrink-0 items-center justify-center rounded-[18px] bg-lime px-8 text-[20px] font-medium text-ink"
            >
              Try OneLink
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </AppShell>
  );
}
