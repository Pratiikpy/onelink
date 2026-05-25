"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowDownToLine, BarChart3, Home, Settings, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { ARC_FAUCET_URL } from "@/lib/arc";
import { HAS_CONTRACT } from "@/lib/contracts";

const nav = [
  { href: "/", label: "Create", icon: Home },
  { href: "/dashboard", label: "Links", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-20 -mx-4 border-b border-white/5 bg-ink/70 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Logo />
            {!HAS_CONTRACT && (
              <span className="hidden items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-200 sm:inline-flex">
                <TriangleAlert className="size-3" />
                Demo
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={ARC_FAUCET_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 transition hover:border-violet/50 hover:text-white sm:flex"
            >
              <ArrowDownToLine className="size-4" />
              Faucet
            </a>
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
          </div>
        </div>
      </header>

      {!HAS_CONTRACT && (
        <div className="-mx-4 border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-center text-[11px] font-bold tracking-wide text-amber-100/90 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          Demo mode · payments are simulated. Deploy the contract to enable real settlement.
        </div>
      )}

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-2">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-violet text-ink"
                      : "border border-white/8 bg-white/[0.03] text-white/72 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/88 px-3 py-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold ${
                  active ? "bg-violet text-ink" : "text-white/55"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
