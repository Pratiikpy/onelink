"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";

import { Logo } from "./logo";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string };

export function MobileNavSheet({
  items,
  ctaLabel = "Open app",
  ctaHref = "/dashboard",
}: {
  items: Item[];
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus management: move focus into the panel on open, restore it to the
  // hamburger trigger on close. The wasOpen guard prevents stealing focus on
  // the initial mount (when the sheet has never been opened).
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      closeRef.current?.focus();
    } else if (wasOpen.current) {
      triggerRef.current?.focus();
    }
  }, [open]);

  // Focus trap: keep Tab focus cycling within the panel while open.
  function onPanelKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === first || !panelRef.current.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="-mr-2 inline-grid h-10 w-10 place-items-center rounded-md text-foreground transition-colors hover:bg-muted md:hidden"
      >
        <Menu className="h-[18px] w-[18px]" />
      </button>

      <div
        className={cn("fixed inset-0 z-50 md:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-background/70 backdrop-blur-xl transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          onKeyDown={onPanelKeyDown}
          className={cn(
            "absolute inset-0 flex flex-col bg-background transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "translate-y-0" : "-translate-y-2 opacity-0",
          )}
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="flex h-14 items-center justify-between px-5">
            <Logo size={24} />
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-grid h-10 w-10 place-items-center rounded-full border border-hairline bg-surface"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>

          <nav className="mt-4 flex-1 divide-y divide-hairline border-y border-hairline">
            {items.map((it) => (
              <Link
                key={it.href + it.label}
                href={it.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-6 py-5 text-[22px] font-display font-medium tracking-[-0.025em] active:bg-muted"
              >
                {it.label}
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
          </nav>

          <div className="px-5 pb-6 pt-6">
            <Link
              href={ctaHref}
              onClick={() => setOpen(false)}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground text-[15px] font-medium text-background"
            >
              {ctaLabel}
            </Link>
            <div className="mt-5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
                Arc Testnet · operational
              </span>
              <span className="font-mono">Testnet build</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
