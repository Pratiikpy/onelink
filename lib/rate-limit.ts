// In-memory fixed-window rate limiter.
//
// NOTE: This limiter is PER-INSTANCE. State lives in a module-level Map and is
// NOT shared across serverless instances / regions. It is an adequate
// abuse-control baseline for Arc Testnet, but it is NOT a distributed limit:
// under horizontal scaling each instance enforces its own window. For
// production-grade, globally-consistent limits, swap this for a shared store
// (e.g. Upstash/Redis).
//
// Date.now() is used for window bookkeeping below; this is a normal runtime
// file (not a deterministic workflow script), so wall-clock time is fine here.

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

type WindowState = { count: number; resetAt: number };

const DEFAULT_LIMIT = 30;
const DEFAULT_WINDOW_MS = 60_000;

const buckets = new Map<string, WindowState>();

/**
 * Fixed-window limiter keyed by an arbitrary string.
 * Returns whether the request is allowed, how many requests remain in the
 * current window, and how many seconds until the window resets.
 */
export function rateLimit(
  key: string,
  opts?: { limit?: number; windowMs?: number },
): RateLimitResult {
  const limit = opts?.limit ?? DEFAULT_LIMIT;
  const windowMs = opts?.windowMs ?? DEFAULT_WINDOW_MS;
  const now = Date.now();

  const existing = buckets.get(key);
  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: Math.max(0, limit - 1), retryAfterSec: Math.ceil(windowMs / 1000) };
  }

  existing.count += 1;
  const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfterSec };
  }
  return { ok: true, remaining: Math.max(0, limit - existing.count), retryAfterSec };
}

/**
 * Derive a client key from request headers. Uses the first hop of
 * `x-forwarded-for`, then `x-real-ip`, falling back to "local".
 */
export function clientKey(req: Request, scope: string): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const firstHop = forwardedFor?.split(",")[0]?.trim();
  const ip = firstHop || req.headers.get("x-real-ip")?.trim() || "local";
  return `${scope}:${ip}`;
}

/**
 * Standard 429 response with a generic message and a `Retry-After` header.
 */
export function tooManyRequests(retryAfterSec: number): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please slow down." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.max(1, Math.ceil(retryAfterSec))),
      },
    },
  );
}
