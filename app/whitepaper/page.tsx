import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, FileText, Link2, ReceiptText, Route, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Footer } from "@/components/footer";
import { ARC_EXPLORER_URL } from "@/lib/arc";

export const metadata: Metadata = {
  title: "OneLink Whitepaper",
  description:
    "A product and technical brief for OneLink, the Arc Testnet USDC payment-link application using Circle CCTP routes.",
};

const principles = [
  {
    title: "One recipient link",
    copy: "Freelancers share a single URL or profile handle instead of negotiating wallet addresses, chain names, and payment instructions with every client.",
  },
  {
    title: "Settlement before status",
    copy: "The interface only presents paid and cancelled states after the server verifies the corresponding Arc Testnet event or transaction outcome.",
  },
  {
    title: "Proof over promises",
    copy: "Every completed standard payment resolves to an Arc receipt with a transaction hash that can be independently checked on Arcscan.",
  },
];

const flow = [
  {
    Icon: Link2,
    label: "01",
    title: "Create",
    copy: "The creator connects a wallet, enters amount and memo, and signs an Arc Testnet invoice creation transaction.",
  },
  {
    Icon: Route,
    label: "02",
    title: "Route",
    copy: "The payer chooses the proven route: direct Arc USDC payment, or Base Sepolia to Arc through Circle App Kit and CCTP.",
  },
  {
    Icon: ReceiptText,
    label: "03",
    title: "Verify",
    copy: "The server reconciles the on-chain result before persisting final state and exposing a receipt.",
  },
];

const stack = [
  ["Arc Testnet", "USDC-first settlement chain, chain id 5042002, with Arcscan verification."],
  ["Circle CCTP", "Burn-and-mint bridge path used for the live-proven Base Sepolia to Arc checkout."],
  ["Circle App Kit", "Bridge orchestration layer used for the Base Sepolia route; bridge operations do not require a kit key."],
  ["Supabase", "Stores payment metadata while final payment state is guarded by server-side verification."],
  ["WalletConnect/RainbowKit", "Wallet connection and signing surface for browser and QR-based payment tests."],
];

const scope = [
  ["Live-proven", "Arc direct payment, WalletConnect signed payment, profile payment, Base Sepolia to Arc bridge, verified cancellation."],
  ["Launch scope", "Testnet USDC only. The public app is not a mainnet financial service."],
  ["Not claimed", "Solana, fiat/card rails, arbitrary-wallet instant settlement, and Circle Gateway checkout are not enabled in this launch build."],
];

export default function WhitepaperPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px]">
        <section className="grid gap-10 xl:grid-cols-[minmax(0,0.92fr)_420px] xl:items-end">
          <div>
            <p className="mono-label text-[12px]">Product whitepaper · Arc Testnet</p>
            <h1 className="mt-6 max-w-[850px] text-balance text-[52px] font-medium leading-[0.96] tracking-[-0.05em] sm:text-[82px]">
              One payment link for supported USDC routes.
            </h1>
            <p className="mt-7 max-w-[760px] text-[18px] leading-8 text-white/58 sm:text-[22px] sm:leading-9">
              OneLink is a testnet payment-link product for freelancers. It removes chain confusion
              from the payment request, settles supported USDC flows to Arc Testnet, and gives both
              sides a verifiable receipt.
            </p>
          </div>

          <aside className="surface relative overflow-hidden rounded-[30px] p-7 sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,242,103,0.18),transparent_58%)]" />
            <div className="relative">
              <div className="inline-flex size-13 items-center justify-center rounded-2xl border border-lime/20 bg-lime/10 text-lime">
                <FileText className="size-6" />
              </div>
              <p className="mono-label mt-8 text-[12px]">Current proof status</p>
              <h2 className="mt-4 text-[34px] font-medium leading-none tracking-[-0.04em]">
                Launch-ready in verified testnet scope.
              </h2>
              <Link
                href="/security"
                className="mt-7 inline-flex items-center gap-2 text-[16px] font-medium text-lime transition hover:text-white"
              >
                View trust center
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </aside>
        </section>

        <section className="mt-16 grid gap-4 sm:mt-20 lg:grid-cols-3">
          {principles.map((item) => (
            <article key={item.title} className="surface rounded-[26px] p-6 sm:p-8">
              <BadgeCheck className="size-5 text-lime" />
              <h2 className="mt-10 text-[28px] font-medium tracking-tight">{item.title}</h2>
              <p className="mt-4 text-[16px] leading-7 text-white/56 sm:text-[18px]">{item.copy}</p>
            </article>
          ))}
        </section>

        <section className="mt-16 border-y border-white/10 py-16 sm:mt-20 sm:py-20">
          <div className="max-w-3xl">
            <p className="mono-label text-[12px]">User flow</p>
            <h2 className="mt-5 text-balance text-[42px] font-medium leading-[1.03] tracking-[-0.045em] sm:text-[64px]">
              The payment state machine stays simple.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {flow.map(({ Icon, label, title, copy }) => (
              <article key={title} className="rounded-[26px] border border-white/10 bg-[#111215] p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="mono-label text-[12px]">{label}</span>
                  <Icon className="size-5 text-lime" />
                </div>
                <h3 className="mt-12 text-[31px] font-medium tracking-tight">{title}</h3>
                <p className="mt-4 text-[17px] leading-7 text-white/56">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-5 xl:grid-cols-[minmax(0,0.86fr)_minmax(420px,1fr)] xl:gap-16">
          <div>
            <p className="mono-label text-[12px]">Architecture</p>
            <h2 className="mt-5 text-[42px] font-medium leading-[1.04] tracking-[-0.045em] sm:text-[62px]">
              Built around verifiable USDC movement.
            </h2>
            <p className="mt-6 max-w-xl text-[18px] leading-8 text-white/56">
              The product uses Arc as the final settlement surface for this launch build. Circle CCTP
              is used where bridging is proven, and server reconciliation prevents the UI from becoming
              the source of truth for payment status.
            </p>
            <a
              href={ARC_EXPLORER_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 text-[16px] font-medium text-white/72 transition hover:text-white"
            >
              Open Arcscan
              <ArrowUpRight className="size-4" />
            </a>
          </div>

          <div className="surface rounded-[28px] p-5 sm:p-7">
            {stack.map(([label, value]) => (
              <div key={label} className="border-b border-white/[0.08] py-5 first:pt-0 last:border-0 last:pb-0">
                <p className="text-[20px] font-medium tracking-tight">{label}</p>
                <p className="mt-2 text-[15px] leading-6 text-white/52 sm:text-[17px]">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-4 sm:mt-20 lg:grid-cols-3">
          {scope.map(([label, value]) => (
            <article key={label} className="rounded-[24px] border border-white/10 bg-white/[0.035] p-6">
              <ShieldCheck className="size-5 text-lime" />
              <h2 className="mt-8 text-[24px] font-medium tracking-tight">{label}</h2>
              <p className="mt-3 text-[16px] leading-7 text-white/56">{value}</p>
            </article>
          ))}
        </section>

        <section className="mt-16 rounded-[30px] border border-lime/20 bg-lime/[0.06] p-7 sm:mt-20 sm:p-10">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mono-label text-[12px]">Demo objective</p>
              <h2 className="mt-4 max-w-2xl text-[34px] font-medium leading-[1.06] tracking-[-0.04em] sm:text-[48px]">
                Show the full path from link creation to receipt verification.
              </h2>
            </div>
            <Link
              href="/create"
              className="inline-flex h-16 shrink-0 items-center justify-center rounded-[18px] bg-lime px-8 text-[20px] font-medium text-ink"
            >
              Create link
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </AppShell>
  );
}
