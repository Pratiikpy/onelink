import { IS_DEMO_MODE } from "@/lib/contracts";

/**
 * Persistent testnet / demo-mode strip.
 *
 * Keyed off real contract truth (IS_DEMO_MODE = no settlement contract is
 * configured) rather than a `?state=demo` URL param, and mounted globally in
 * the root layout so EVERY screen — not just the pay page — discloses that no
 * real funds settle. For a money product, conflating test and live is a trust
 * hazard; this makes the demo status impossible to miss.
 */
export function DemoBanner() {
  if (!IS_DEMO_MODE) return null;
  return (
    <div className="border-b border-hairline bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-5 py-2 text-center md:px-6">
        <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-warning animate-pulse-dot" />
        <p className="font-mono text-[11px] tracking-wide">
          Demo mode · Arc Testnet · no real funds settle — receipts use{" "}
          <span className="opacity-70">0xDEM0…</span>
        </p>
      </div>
    </div>
  );
}
