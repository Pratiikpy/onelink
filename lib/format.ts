/**
 * Display-only formatting helpers shared across pages.
 * No backend coupling — every value comes in pre-fetched from `lib/storage`.
 */

const usdcFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a USDC amount (number or numeric string) with 2 decimals + thousand separators. */
export function formatUSDC(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "0.00";
  return usdcFormatter.format(n);
}

/** Truncate an EVM address to 0xABCD…WXYZ form. */
export function truncateAddr(address?: string | null, head = 6, tail = 4): string {
  if (!address) return "—";
  if (address.length <= head + tail + 1) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

/** Truncate a tx hash to 0xABCDEFGH…IJKLMNOP form. */
export function shortHash(hash?: string | null): string {
  return truncateAddr(hash, 10, 8);
}

/**
 * "in 5 days" / "2 hours ago" — narrow, locale-aware.
 * Falls back to absolute date for distances above ~30 days.
 */
export function relativeTime(input: string | number | Date | null | undefined): string {
  if (!input) return "—";
  const d = new Date(input);
  if (!Number.isFinite(d.getTime())) return "—";

  const diffSeconds = (d.getTime() - Date.now()) / 1000;
  const abs = Math.abs(diffSeconds);

  // Use Intl.RelativeTimeFormat where supported; falls back to compact strings.
  const rtf =
    typeof Intl !== "undefined" && "RelativeTimeFormat" in Intl
      ? new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "long" })
      : null;

  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 365 * 24 * 60 * 60],
    ["month", 30 * 24 * 60 * 60],
    ["week", 7 * 24 * 60 * 60],
    ["day", 24 * 60 * 60],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, secondsInUnit] of ranges) {
    if (abs >= secondsInUnit || unit === "second") {
      const value = Math.round(diffSeconds / secondsInUnit);
      return rtf ? rtf.format(value, unit) : `${Math.abs(value)} ${unit}${Math.abs(value) === 1 ? "" : "s"}`;
    }
  }
  return "—";
}

/** "Mon, May 28 · 14:22" — for absolute date display. */
export function formatDateTime(input: string | number | Date | null | undefined): string {
  if (!input) return "—";
  const d = new Date(input);
  if (!Number.isFinite(d.getTime())) return "—";
  const date = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} · ${time}`;
}
