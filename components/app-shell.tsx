"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FilePlus2, Link2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { shortAddress } from "@/lib/payments";

const nav = [
  { href: "/create", label: "Create" },
  { href: "/dashboard", label: "Links" },
  { href: "/security", label: "Security" },
  { href: "/whitepaper", label: "Whitepaper" },
];
const mobileNav = [
  { href: "/create", label: "Create", Icon: FilePlus2 },
  { href: "/dashboard", label: "Links", Icon: Link2 },
  { href: "/security", label: "Security", Icon: ShieldCheck },
];

function WalletControl({ compact }: { compact?: boolean }) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected = ready && account && chain;

        if (!ready) {
          return <div className="h-14 w-[220px] rounded-[28px] border border-white/10 bg-white/5" />;
        }

        if (!connected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className={clsx(
                "rounded-[22px] bg-lime font-medium tracking-tight text-ink",
                compact
                  ? "h-11 min-w-[150px] px-6 text-lg"
                  : "h-11 min-w-[124px] px-4 text-[15px] sm:h-14 sm:min-w-[220px] sm:px-6 sm:text-2xl xl:h-[56px] xl:min-w-[184px] xl:rounded-[18px] xl:px-7 xl:text-[21px]",
              )}
            >
              Connect wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className={clsx(
                "rounded-[26px] border border-danger/40 bg-danger/10 px-6 text-white",
                compact ? "h-11 text-base" : "h-11 text-base sm:h-12 sm:text-xl xl:h-[66px] xl:text-3xl",
              )}
            >
              Wrong network
            </button>
          );
        }

        return (
            <button
              type="button"
              onClick={openAccountModal}
              className={clsx(
                "inline-flex items-center gap-4 rounded-[28px] border border-white/10 bg-[#1A1A1E] px-7 text-snow",
                compact
                  ? "h-11 min-w-[170px] px-5 text-lg"
                  : "h-11 min-w-[132px] gap-2 px-4 text-[15px] sm:h-14 sm:min-w-[220px] sm:gap-4 sm:px-5 sm:text-2xl xl:h-[50px] xl:min-w-[180px] xl:px-5 xl:text-[18px]",
              )}
            >
              <span className="size-2.5 rounded-full bg-lime xl:size-4" />
              {shortAddress(account.address)}
            </button>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function AppShell({
  children,
  mode = "default",
}: {
  children: React.ReactNode;
  mode?: "default" | "pay";
}) {
  const pathname = usePathname();

  const createActive = pathname === "/" || pathname.startsWith("/create");
  const isPay = mode === "pay";
  const showMobileNav =
    pathname.startsWith("/create") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings");

  if (isPay) {
    return (
      <main className="min-h-[100svh] bg-ink text-snow sm:bg-[#0e0f11] sm:px-5 sm:py-6">
        <div className="mx-auto flex min-h-[100svh] w-full max-w-[430px] flex-col bg-ink sm:min-h-[calc(100svh-3rem)] sm:overflow-hidden sm:rounded-[30px] sm:border sm:border-white/10 sm:shadow-[0_22px_80px_rgba(0,0,0,0.45)]">
          <header className="shrink-0 border-b border-white/[0.06] px-6 pb-4 pt-5">
            <div className="flex items-center justify-between">
              <Logo compact={false} variant="pay" />
              <div className="text-center">
                <div className="inline-flex w-[110px] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/6 py-[5px] font-mono text-[11px] uppercase tracking-[0.16em] text-white/58">
                  <span className="size-[7px] rounded-full bg-lime" />
                  ARC
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/58">
                  TESTNET
                </p>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 px-6 pb-5 pt-6">{children}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-ink text-snow">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[84px] w-full max-w-none items-center gap-3 px-4 sm:h-[94px] sm:gap-8 sm:px-10 xl:h-[110px] xl:gap-[58px] xl:px-[60px]">
          <Logo compact={false} />

          {!isPay && (
            <nav className="hidden items-center gap-10 xl:flex">
              {nav.map((item) => {
                const active =
                  item.href === "/create" ? createActive : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "text-2xl font-semibold tracking-tight xl:text-[20px]",
                      active ? "text-snow" : "text-white/30 hover:text-white/62",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="ml-auto flex items-center gap-8">
            {!isPay && (
              <div className="hidden text-right font-mono text-[14px] uppercase tracking-[0.28em] text-white/40 md:block">
                <div>Arc</div>
                <div className="mt-1">Testnet</div>
              </div>
            )}
            {!isPay && <WalletControl />}
          </div>
        </div>
      </header>

      {showMobileNav && (
        <nav
          aria-label="Mobile navigation"
          className="mx-4 mt-4 grid grid-cols-3 rounded-[22px] border border-white/10 bg-[#131316] p-2 sm:hidden"
        >
          {mobileNav.map(({ href, label, Icon }) => {
            const active = href === "/create" ? createActive : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex h-14 flex-col items-center justify-center gap-1 rounded-[16px] text-[12px] font-medium",
                  active ? "bg-white/[0.08] text-lime" : "text-white/48",
                )}
              >
                <Icon className="size-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>
      )}

      <div
        className={clsx(
          "mx-auto min-w-0 w-full max-w-none overflow-x-hidden",
          "px-4 pb-12 pt-16 sm:px-10 sm:pt-20 xl:px-16",
        )}
      >
        {children}
      </div>
    </main>
  );
}
