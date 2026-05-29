"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { Logo } from "./logo";
import { MobileNavSheet } from "./mobile-nav-sheet";
import { cn } from "@/lib/utils";
import { truncateAddr } from "@/lib/format";

/** Back-compat export; same as <Logo />. */
export function Wordmark({ className }: { className?: string }) {
  return <Logo className={className} />;
}

function useScrolled(threshold = 8) {
  const [s, setS] = useState(false);
  useEffect(() => {
    const onScroll = () => setS(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return s;
}

export function MarketingNav() {
  const scrolled = useScrolled();
  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-hairline bg-background/75 backdrop-blur-xl"
          : "border-b border-transparent bg-background/0",
      )}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-[13px] text-muted-foreground md:flex">
          <Link href="/#product" className="link-underline hover:text-foreground">
            Product
          </Link>
          <Link href="/#routes" className="link-underline hover:text-foreground">
            Routes
          </Link>
          <Link href="/how-it-works" className="link-underline hover:text-foreground">
            How it works
          </Link>
          <Link href="/#pricing" className="link-underline hover:text-foreground">
            Pricing
          </Link>
          <Link href="/whitepaper" className="link-underline hover:text-foreground">
            Whitepaper
          </Link>
          <Link href="/security" className="link-underline hover:text-foreground">
            Security
          </Link>
        </nav>
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/pitch"
            className="hidden text-[13px] text-muted-foreground hover:text-foreground sm:inline"
          >
            Pitch
          </Link>
          <Link
            href="/dashboard"
            className="hidden md:inline-flex h-8 items-center rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-transform duration-200 hover:-translate-y-px"
          >
            Open app
          </Link>
          <MobileNavSheet
            items={[
              { href: "/#product", label: "Product" },
              { href: "/#routes", label: "Routes" },
              { href: "/how-it-works", label: "How it works" },
              { href: "/#pricing", label: "Pricing" },
              { href: "/whitepaper", label: "Whitepaper" },
              { href: "/security", label: "Security" },
              { href: "/pitch", label: "Pitch" },
              { href: "/brand", label: "Brand kit" },
              { href: "/dashboard", label: "Open app" },
            ]}
          />
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-14 text-sm md:grid-cols-4 md:px-6">
        <div className="col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-pretty text-muted-foreground">
            USDC payment links. Verified on-chain on Arc Testnet. Built for freelancers, creators
            and Web3 teams.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            All systems on Arc Testnet
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Product
          </p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/create" className="hover:text-foreground">
                Create link
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-foreground">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/pitch" className="hover:text-foreground">
                Pitch deck
              </Link>
            </li>
            <li>
              <Link href="/whitepaper" className="hover:text-foreground">
                Whitepaper
              </Link>
            </li>
            <li>
              <Link href="/brand" className="hover:text-foreground">
                Brand kit
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Trust
          </p>
          <ul className="mt-4 space-y-2.5 text-muted-foreground">
            <li>
              <Link href="/security" className="hover:text-foreground">
                Security
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-foreground">
                Terms
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/Pratiikpy/onelink"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-[11px] text-muted-foreground md:px-6">
          <p>© {new Date().getFullYear()} OneLink Labs · Testnet only</p>
          <p className="font-mono tracking-wide">Arc · chain 5042002 · USDC</p>
        </div>
      </div>
    </footer>
  );
}

export function AppNav() {
  const scrolled = useScrolled();
  const path = usePathname();
  const { address, isConnected } = useAccount();
  const nav = [
    { href: "/dashboard", label: "Overview" },
    { href: "/create", label: "New link" },
    { href: "/settings", label: "Settings" },
  ] as const;
  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background,border-color] duration-300",
        scrolled
          ? "border-b border-hairline bg-background/80 backdrop-blur-xl"
          : "border-b border-hairline/60 bg-background",
      )}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 md:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => {
              const active = path === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "relative rounded-md px-3 py-1.5 text-[13px] transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {n.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-[14px] h-px bg-foreground" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden h-7 items-center gap-1.5 rounded-full border border-hairline bg-surface px-2.5 text-[11px] sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" /> Arc Testnet
          </span>
          {isConnected && address ? (
            <span className="inline-flex h-7 items-center gap-2 rounded-full border border-hairline bg-surface px-2 pr-2.5 font-mono text-[11px]">
              <span
                className="h-4 w-4 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 200deg, oklch(0.16 0.004 260), oklch(0.5 0.05 158), oklch(0.16 0.004 260))",
                }}
              />
              {truncateAddr(address)}
            </span>
          ) : (
            <span className="hidden h-7 items-center gap-2 rounded-full border border-hairline bg-surface px-2.5 font-mono text-[11px] text-muted-foreground sm:inline-flex">
              Not connected
            </span>
          )}
          <MobileNavSheet
            items={[
              { href: "/dashboard", label: "Overview" },
              { href: "/create", label: "New link" },
              { href: "/settings", label: "Settings" },
              { href: "/", label: "Marketing site" },
            ]}
            ctaLabel="New link"
            ctaHref="/create"
          />
        </div>
      </div>
    </header>
  );
}
