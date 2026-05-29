import { SUPPORTED_SOURCE_CHAINS } from "@/lib/arc";

export type PayRoute = "arc-direct" | "app-kit-bridge" | "unified-balance" | "demo";

const bridgeSource = SUPPORTED_SOURCE_CHAINS[0];

/**
 * Calm, money-safe fallback shown for anything we don't explicitly recognize.
 * The cardinal rule for a payments UI: never surface a raw wallet/RPC/SDK
 * string to the user, and always reassure that funds are safe unless the wallet
 * actually confirmed.
 */
const SAFE_FALLBACK =
  "Something interrupted this — no funds moved unless your wallet confirmed. Please try again.";

/**
 * Maps raw wallet / chain / Circle SDK errors to friendly, action-oriented
 * copy. Unrecognized errors fall back to SAFE_FALLBACK; the raw detail is
 * logged to the console in development only, never rendered to the user.
 */
export function friendlyError(err: unknown, opts: { route?: PayRoute } = {}): string {
  const { route } = opts;
  const raw = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const lower = raw.toLowerCase();

  if (process.env.NODE_ENV !== "production") {
    console.error("[onelink] error:", err);
  }

  if (!raw) return SAFE_FALLBACK;
  if (lower.includes("rejected") || lower.includes("denied") || lower.includes("user refused")) {
    return "Wallet request was rejected. Nothing moved — try again when you're ready.";
  }
  if (lower.includes("unsupported") || lower.includes("select a supported")) {
    return route === "app-kit-bridge"
      ? `Switch to ${bridgeSource.label} for the Circle CCTP route, then retry.`
      : "Switch to Arc Testnet for direct payment, then retry.";
  }
  if (lower.includes("insufficient") || lower.includes("balance")) {
    return route === "app-kit-bridge"
      ? `Not enough USDC on the selected source chain. Fund ${bridgeSource.label} or pay directly on Arc.`
      : "Not enough Arc USDC for this payment. Top up Arc Testnet USDC, then retry.";
  }
  if (lower.includes("bridge") || lower.includes("cctp")) {
    return "The Circle CCTP bridge didn't finish. If a burn/mint completed, refresh; otherwise retry.";
  }
  if (lower.includes("gateway")) {
    return "Circle Gateway didn't finish. Confirm you've deposited USDC into Gateway, then retry.";
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "This timed out before completing. No funds moved unless your wallet confirmed — please retry.";
  }
  return SAFE_FALLBACK;
}
