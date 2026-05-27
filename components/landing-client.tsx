"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Link2, ReceiptText, Route } from "lucide-react";
import { Footer } from "@/components/footer";
import { RingIcon } from "@/components/logo";
import { HAS_CONTRACT } from "@/lib/contracts";

export function LandingClient() {
  return (
    <div className="overflow-hidden pb-4">
      <section className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-10 xl:grid-cols-[minmax(0,1fr)_712px] xl:px-16">
        <div className="min-w-0 space-y-7 pt-6 sm:space-y-8 sm:pt-16">
          <span className="inline-flex items-center gap-3 rounded-full border border-lime/20 bg-lime/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-lime sm:px-5 sm:py-2.5 sm:text-[15px]">
            <span className="relative inline-flex size-6 items-center justify-center rounded-full bg-lime/25">
              <span className="size-3 rounded-full bg-lime" />
            </span>
            Arc Testnet · {HAS_CONTRACT ? "Settlement live" : "Preview mode"}
          </span>

          <h1 className="max-w-[760px] text-balance text-[clamp(54px,7vw,136px)] font-medium leading-[0.92] tracking-[-0.04em]">
            <span className="block">One link.</span>
            <span className="block">USDC routes.</span>
            <span className="block text-lime">Verified.</span>
          </h1>

          <p className="max-w-[760px] text-[20px] leading-[1.48] text-white/55 sm:text-[31px]">
            A shareable payment link for USDC on Arc. Pay directly on Arc or bridge from Base
            Sepolia through Circle CCTP. Verified Arc receipt.
          </p>

          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:flex-wrap">
            <Link
              href="/create"
              className="inline-flex h-[72px] w-full items-center justify-center rounded-[20px] bg-lime px-8 text-[25px] font-medium tracking-tight text-ink sm:h-[92px] sm:w-auto sm:min-w-[265px] sm:rounded-[24px] sm:px-10 sm:text-[31px]"
            >
              Create a link →
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-[72px] w-full items-center justify-center rounded-[20px] border border-white/12 bg-white/5 px-8 text-center text-[25px] font-medium leading-tight tracking-tight text-white sm:h-[92px] sm:w-auto sm:min-w-[292px] sm:rounded-[24px] sm:px-10 sm:text-[31px]"
            >
              <span>
                See how it
                <br />
                works
              </span>
            </a>
          </div>
        </div>

        <article className="surface relative min-w-0 overflow-hidden rounded-[28px] p-6 sm:rounded-[44px] sm:p-12 xl:mt-40 xl:max-w-[712px] xl:translate-x-2">
          <div className="flex items-center justify-between">
            <RingIcon className="h-10 w-10 text-lime" />
            <span className="sr-only">Illustrative invoice preview</span>
          </div>

          <span className="pointer-events-none absolute right-6 top-[28px] inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[15px] font-semibold text-white/88 sm:right-14 sm:top-[50px] sm:px-5 sm:text-[20px]">
            <span className="size-3 rounded-full bg-white/75" />
            Unpaid
          </span>

          <p className="mono-label mt-10 text-[10px] sm:mt-14 sm:text-[12px]">Illustrative invoice</p>
          <div className="pt-5 sm:pt-7">
            <p className="mono-label text-[14px]">Amount due</p>
          </div>
          <div className="mt-2 flex items-end gap-3">
            <p className="text-[clamp(68px,7vw,126px)] leading-none tracking-[-0.04em]">250.00</p>
            <span className="pb-2 text-[20px] text-white/55 sm:text-[34px]">USDC</span>
          </div>

          <p className="mono-label mt-8 text-[12px] sm:mt-12 sm:text-[14px]">For</p>
          <p className="mt-3 text-[21px] font-medium leading-[1.15] tracking-tight sm:mt-4 sm:text-[31px] sm:leading-[1.05]">Branding work · invoice #0042</p>

          <div className="mt-8 border-t border-white/10 pt-6 sm:mt-12 sm:pt-9">
            <div className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <span className="size-10 rounded-full bg-[#44454c] sm:size-14" />
                <div>
                  <p className="text-[16px] leading-none text-white/62 sm:text-[22px]">To</p>
                  <p className="mt-1 text-[16px] font-medium text-white/82 sm:text-[22px]">
                    Freelancer wallet
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="mono-label text-[10px] sm:text-[13px]">Expires in</p>
                <p className="mt-1 text-[16px] font-medium text-white/55 sm:text-[22px]">6D</p>
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-12">
            <Link
              href="/create"
              className="inline-flex h-[68px] w-full items-center justify-center rounded-[18px] bg-lime text-[20px] font-medium tracking-tight text-ink sm:h-[92px] sm:rounded-[22px] sm:text-[28px]"
            >
              Create a real payment link
            </Link>
          </div>
        </article>
      </section>

      <section
        className="mt-12 flex flex-col gap-6 border-y border-white/10 py-7 text-[16px] font-medium text-white/72 sm:mt-16 sm:text-[22px] xl:flex-row xl:items-center xl:justify-between xl:gap-10"
      >
        <p className="mono-label text-[14px]">
          Proven bridge from
          <br />
          Base Sepolia · arc chain 5042002
        </p>

        <div className="flex flex-wrap items-center gap-5 sm:gap-7 xl:flex-nowrap xl:gap-8">
          <span className="inline-flex items-center gap-4">
            <span className="size-5 rounded bg-[#1658f9] sm:size-8 sm:rounded-lg" />
            Base
          </span>
          <span className="inline-flex items-center gap-4">
            <span className="size-5 rounded bg-[#627eea] sm:size-8 sm:rounded-lg" />
            Ethereum · beta
          </span>
          <span className="inline-flex items-center gap-4">
            <span className="size-5 rounded bg-[#31a7f8] sm:size-8 sm:rounded-lg" />
            Arbitrum · beta
          </span>
          <span className="inline-flex items-center gap-4">
            <span className="size-5 rounded bg-[#8247e5] sm:size-8 sm:rounded-lg" />
            Polygon · beta
          </span>
        </div>

        <p className="mono-label text-right text-[14px]">
          Base tested live · verified Arc receipt · 0 fiat ramps
        </p>
      </section>

      <section id="how-it-works" className="py-20 sm:py-28 xl:px-16">
        <div className="max-w-3xl">
          <p className="mono-label text-[12px]">How it works</p>
          <h2 className="mt-5 text-balance text-[42px] font-medium leading-[1.02] tracking-[-0.045em] sm:text-[66px]">
            Payment links that end in proof.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {[
            {
              number: "01",
              Icon: Link2,
              title: "Create and share",
              copy: "Connect your wallet, set the amount and memo, then share a single URL or permanent profile handle.",
            },
            {
              number: "02",
              Icon: Route,
              title: "Payer chooses a route",
              copy: "Pay directly on Arc Testnet, or use the proven Base Sepolia bridge path powered by Circle CCTP.",
            },
            {
              number: "03",
              Icon: ReceiptText,
              title: "Verify settlement",
              copy: "A server-verified Arc transaction seals the paid state and creates a shareable receipt.",
            },
          ].map(({ number, Icon, title, copy }) => (
            <article key={number} className="surface rounded-[26px] p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="mono-label text-[12px]">{number}</span>
                <Icon className="size-5 text-lime" />
              </div>
              <h3 className="mt-12 text-[28px] font-medium tracking-tight">{title}</h3>
              <p className="mt-4 text-[16px] leading-7 text-white/55 sm:text-[18px]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 border-y border-white/10 py-14 sm:py-20 xl:grid-cols-[minmax(0,0.8fr)_minmax(420px,1fr)] xl:gap-20 xl:px-16">
        <div>
          <p className="mono-label text-[12px]">Verified in production</p>
          <h2 className="mt-5 text-[40px] font-medium leading-[1.05] tracking-[-0.045em] sm:text-[58px]">
            Tested like a payment product.
          </h2>
          <p className="mt-5 max-w-lg text-[17px] leading-7 text-white/55">
            The deployed testnet app has completed direct payments, WalletConnect signing,
            permanent profile payments, and Base-to-Arc bridge checkout with persisted receipts.
          </p>
        </div>
        <div className="surface rounded-[26px] p-5 sm:p-8">
          {[
            ["Arc direct payment", "Verified"],
            ["WalletConnect signed payment", "Verified"],
            ["Base Sepolia → Arc CCTP", "Verified"],
            ["Server reconciled receipts", "Verified"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 border-b border-white/[0.08] py-4 first:pt-0 last:border-0 last:pb-0">
              <span className="text-[15px] text-white/66 sm:text-[18px]">{label}</span>
              <span className="inline-flex items-center gap-2 text-[14px] font-medium text-lime sm:text-[16px]">
                <BadgeCheck className="size-4" />
                {value}
              </span>
            </div>
          ))}
          <Link
            href="/security"
            className="mt-7 inline-flex items-center gap-2 text-[15px] font-medium text-white/72 transition hover:text-white"
          >
            View testnet safety and proof scope
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="py-20 text-center sm:py-28">
        <p className="mono-label text-[12px]">Ready to collect</p>
        <h2 className="mx-auto mt-5 max-w-[850px] text-balance text-[43px] font-medium leading-[1.04] tracking-[-0.045em] sm:text-[72px]">
          Send one link. Receive verified USDC on Arc.
        </h2>
        <Link
          href="/create"
          className="mt-10 inline-flex h-[68px] items-center justify-center rounded-[20px] bg-lime px-9 text-[21px] font-medium text-ink sm:h-[78px] sm:px-12 sm:text-[25px]"
        >
          Create a payment link
        </Link>
        <p className="mt-5 text-[13px] text-white/42">Arc Testnet only · no fiat payments · funded testnet wallet required</p>
      </section>

      <Footer />
    </div>
  );
}
