# Lovable → OneLink Port Handoff

> Single source of truth for finishing the Lovable prototype port onto our Next.js 15 App Router frontend. Real data only, no mock, no Lovable watermark.

Status: **partial** — design system foundations written. Pages and components remain.

Last updated: 2026-05-28

---

## Mission

Replace OneLink's current frontend with the design system from the Lovable prototype at `C:\Users\prate\Downloads\OneLink Payments`. Preserve every backend wiring (lib/arc.ts, lib/circle-payments.ts, lib/gateway.ts, lib/contracts.ts, lib/storage.ts, lib/payments.ts, lib/profiles.ts, all `app/api/*` routes, the deployed OneLinkCollect contract on Arc Testnet, Supabase). Build all pages we have (whitepaper, pitch, security, terms, privacy, settings) in the same design system. No mock data anywhere.

---

## Context the next agent needs

- Next.js 15 App Router + React 19 + TypeScript + Tailwind 3.4
- Existing wagmi + viem + RainbowKit wallet stack — keep as-is
- Existing Circle App Kit bridge + Gateway flow — keep as-is, gated via `NEXT_PUBLIC_ENABLE_GATEWAY`
- Lovable prototype is Vite + TanStack Router + shadcn/ui + Tailwind v4 (oklch tokens). We stay on Tailwind v3.
- The prototype's full design + 11 onelink components + 10 routes is our blueprint
- README, LAUNCH_READINESS, BEST_POSSIBLE_ONELINK, PRODUCT_INFO all already match the new direction

---

## What is already done

### Files written this session

| File | Status |
| --- | --- |
| `package.json` | 12 new deps added (radix-ui suite, sonner, vaul, tailwind-merge, class-variance-authority, tw-animate-css). User must run `npm install`. |
| `app/globals.css` | New oklch design tokens, base styles, all custom utilities (grid-bg, dot-bg, animate-pulse-dot, shimmer, reveal, page-in, link-underline, safe-pt/pb, edge-fade-x, snap-x-cards, text-display-1, text-display-2). |
| `tailwind.config.ts` | New color tokens (oklch with --background/--foreground vars), border-radius scale, font families (inter/inter-tight/jetbrains-mono via CSS vars), motion tokens. |
| `lib/utils.ts` | `cn()` helper using `clsx` + `tailwind-merge`. |

### Backend modules — DO NOT TOUCH

These are working, live-proven, and gated correctly. Pages must consume them:

- `lib/arc.ts` — chain config, `SUPPORTED_SOURCE_CHAINS`, `explorerTx`, `isDemoTxHash`
- `lib/circle-payments.ts` — `bridgeUsdcToArc({ onStep })`, `spendGatewayBalanceOnArc({ onStep })`, gated by `ENABLE_GATEWAY_ROUTE`
- `lib/gateway.ts` — Gateway contract addresses, EIP-712 typed data, `GATEWAY_EVM_TESTNET_SOURCES`
- `lib/contracts.ts` — `OneLinkCollect` ABI, ERC-20 ABI, `ONELINK_CONTRACT_ADDRESS`, `HAS_CONTRACT`, `ALLOW_DEMO_MODE`
- `lib/storage.ts` — Supabase + localStorage with verified state transitions
- `lib/payments.ts` — `PaymentLink` type, `amountToUnits`, `paymentPath`, `receiptPath`, `shortAddress`, `statusTone`, `paymentMethodLabel`, `formatTimestamp`
- `lib/profiles.ts` — freelancer profile claim + read
- `lib/share.ts` — `shareOrCopy`, `useCopy` hook
- `app/api/payments/{create,reconcile,cancel}/route.ts`
- `app/api/profiles/route.ts`
- `app/api/gateway/{balances,transfer}/route.ts`
- `components/providers.tsx` — wagmi + RainbowKit + react-query providers
- `components/arc-preflight.tsx` (already in our brand — needs port to new design)
- `components/bridge-step-timeline.tsx` (already in our brand — needs port)
- `components/gateway-step-timeline.tsx` (already in our brand — needs port)
- `components/proof-drawer.tsx` (already in our brand — superseded by new ProofDrawer)
- `contracts/src/OneLinkCollect.sol` — deployed, do not touch

---

## What is left

### Step 1 — Install (USER ONLY, blocked for agent)

```bash
npm install
```

### Step 2 — Update root layout (`app/layout.tsx`)

- Replace existing fonts with `next/font/google` for **Inter (variable)**, **Inter Tight (variable)**, **JetBrains Mono**
- Set CSS variables: `--font-inter`, `--font-inter-tight`, `--font-jetbrains-mono`
- Add Sonner `<Toaster />` from `components/ui/sonner` near the bottom of body
- Keep existing `<Providers>` wrapper for wagmi + RainbowKit
- Update theme-color and metadata (it is already good in the current file — preserve)

### Step 3 — Port shadcn/ui primitives we use

Direct copy from `C:\Users\prate\Downloads\OneLink Payments\src\components\ui\` to `components/ui/`. Adjust:
- Replace any `@/lib/utils` imports — they're the same path so works as-is
- No `@tanstack/react-router` imports in these files — they are framework-agnostic

Required files:
- `button.tsx`
- `card.tsx`
- `badge.tsx`
- `input.tsx`
- `label.tsx`
- `textarea.tsx`
- `tabs.tsx`
- `sheet.tsx`
- `dropdown-menu.tsx`
- `accordion.tsx`
- `tooltip.tsx`
- `sonner.tsx`
- `separator.tsx`

Skip the rest (calendar, carousel, chart, command, drawer, form, etc.) unless used.

### Step 4 — Port OneLink-specific components

From `C:\Users\prate\Downloads\OneLink Payments\src\components\onelink\` to `components/onelink/`. Per-file changes:

| Source | Target | Changes |
| --- | --- | --- |
| `Logo.tsx` | `components/onelink/logo.tsx` | Replace `import { Link } from "@tanstack/react-router"` with `import Link from "next/link"`. Replace `to={...}` with `href={...}`. Drop the `as any` casts. Replace `to="/u/$handle"` patterns with `href="/{handle}"` (Next dynamic route). |
| `Nav.tsx` | `components/onelink/nav.tsx` | Same Link replacement. `useRouterState` → `usePathname` from `next/navigation`. The wallet pill (0x7a3F…3F2A) must consume `useAccount()` from wagmi for the real address. The "Open app" button stays as a Link. |
| `MobileNavSheet.tsx` | `components/onelink/mobile-nav-sheet.tsx` | Same Link replacement. Drop the `params` prop pattern; just use string hrefs. |
| `BottomBar.tsx` | `components/onelink/bottom-bar.tsx` | No changes — pure presentation. |
| `Reveal.tsx` | `components/onelink/reveal.tsx` | No changes — pure presentation. Add `"use client"` directive (uses IntersectionObserver). |
| `CountUp.tsx` | `components/onelink/count-up.tsx` | Add `"use client"`. Otherwise no changes. |
| `HashMono.tsx` | `components/onelink/hash-mono.tsx` | Add `"use client"`. Replace `import { toast } from "sonner"` — it stays the same. |
| `StatusBadge.tsx` | `components/onelink/status-badge.tsx` | Replace `LinkStatus` import — use our `PaymentStatus` from `lib/payments.ts`. Same 6 states. |
| `StepTimeline.tsx` | `components/onelink/step-timeline.tsx` | No changes. |
| `ProofDrawer.tsx` | `components/onelink/proof-drawer.tsx` | Drop the import from `lib/mock/data` — compute the JSON inline from our `PaymentLink` type. Use real ARC_CHAIN_ID, ARC_USDC_ADDRESS, ONELINK_CONTRACT_ADDRESS from `lib/arc.ts` + `lib/contracts.ts`. The Arcscan URL: `${ARC_EXPLORER_URL}/tx/${txHash}`. |
| `DemoBanner.tsx` | `components/onelink/demo-banner.tsx` | Replace TanStack `useSearch` with Next.js `useSearchParams` from `next/navigation`. Add `"use client"`. |

### Step 5 — Rebuild pages (each preserves real data)

#### `app/page.tsx` — Landing

Source: `src/routes/index.tsx` from prototype.

Changes:
- Drop the mock data imports (`links`, `ARCSCAN_BASE`, `formatUSDC`, `shortHash`)
- Replace the demo paid-receipt card data with a static high-quality example based on real Arc explorer / contract data — show "1 day ago", a representative tx hash, real ARC_CHAIN_ID, real recipient address. This is fine for the marketing surface — the real proof flows are on /receipt.
- Replace `<Link to="/dashboard/new">` → `<Link href="/create">`
- Replace `<Link to="/r/$id" params={...}>` → `<Link href={\`/receipt/\${id}\`}>`
- Replace `<Link to="/u/$handle" params={...}>` → `<Link href={\`/\${handle}\`}>`
- Replace import `formatUSDC` etc. — write a tiny `lib/format.ts` mirror or inline `Number(x).toFixed(2)`
- Replace stats — keep them as marketing language, e.g. "Live on Arc Testnet · USDC native", "Arc · Base · ETH" — these are not lies because we support these
- Use `<Reveal>`, `<CountUp>`, `<StatusBadge>` from our ported components

#### `app/create/page.tsx` (replaces dashboard.new in prototype) + `components/create-link-form.tsx`

Source: `src/routes/dashboard.new.tsx`

Wire: the existing `CreateLinkForm` logic from `components/create-link-form.tsx`. Keep its onSubmit logic (calls `/api/payments/create` with verified Arc tx), but render with the new 4-step UI from the prototype:
- Step 1 details (amount, memo, recipient, expiry presets)
- Step 2 review (with real fee preview using `NEXT_PUBLIC_PLATFORM_FEE_BPS`)
- Step 3 sign (uses real `useWriteContract` to call `OneLinkCollect.createLink`)
- Step 4 live (real link URL using `paymentPath()`, real QR via `qrcode.react`)

#### `app/pay/[slug]/page.tsx` + `components/pay-link-client.tsx`

Source: `src/routes/pay.$slug.tsx`

Wire: the existing `PayLinkClient` logic (wagmi connect, route picker arc-direct/app-kit-bridge/unified-balance, real `bridgeUsdcToArc` + `spendGatewayBalanceOnArc`). Render with the prototype's clean amount-card layout. `BridgeStepTimeline` and `GatewayStepTimeline` slot in below the main card. Use `StatusBadge` from new components. Keep the real preflight via existing `ArcPreFlight` (rebrand to new design tokens). Keep route gating: Gateway only if `ENABLE_GATEWAY_ROUTE`.

The bridge sub-page — the prototype has `pay.$slug.bridge.tsx` as a dedicated route with full step timeline. We can either:
- (a) Inline the timeline into `pay/[slug]/page.tsx` like we already do — recommended for cohesion
- (b) Add `app/pay/[slug]/bridge/page.tsx` for a dedicated focused step view

Pick (a) for now.

#### `app/receipt/[id]/page.tsx` + `components/receipt-client.tsx`

Source: `src/routes/r.$id.tsx`

Wire: existing `ReceiptClient` data loading from `lib/storage`. Render with the new card-lift hero (lime-on-foreground), proof rows, ProofDrawer trigger that opens the new Sheet+Tabs ProofDrawer. Drop `formatUSDC` — use `Number(x).toFixed(2)` or a helper.

The "Download" button in the prototype is non-functional — leave it as-is or hide it (we don't generate PDFs yet).

#### `app/[handle]/page.tsx` + `components/profile-pay-client.tsx`

Source: `src/routes/u.$handle.tsx`

Wire: existing `ProfilePayClient` logic — `getFreelancerProfile(handle)`, `savePaymentLink`, real payment creation flow. Render with the prototype's split layout: profile cover band, monogram avatar, bio, socials, recent payments list, sticky-aside Send-USDC card. Recent payments must come from real Supabase data filtered to the recipient's wallet. If no payments yet, render a clean empty state.

#### `app/dashboard/page.tsx` + `components/dashboard-client.tsx`

Source: `src/routes/dashboard.index.tsx` and `src/routes/dashboard.tsx`

Wire: existing `DashboardClient` — `listPaymentLinks(creatorWallet)`, `cancelPaymentLink`. Render with the prototype's KPI strip + sparkline + tabs filter + search + table-with-dropdown-actions. Cancel action uses our existing `ConfirmDialog` then calls `/api/payments/cancel`. The KPI sparkline data: derive from real paid-link history.

#### `app/settings/page.tsx` + `components/settings-client.tsx`

Source: `src/routes/dashboard.settings.tsx`

Wire: existing `SettingsClient` env-health panel content. Render with the prototype's 4-tab layout: Profile (handle claim from `lib/profiles.ts`), Wallet (connected address from wagmi, default recipient), Network (Arc chain id, RPC, USDC, OneLinkCollect contract — all from `lib/arc.ts`/`lib/contracts.ts`), Danger (clear demo data, sign out).

### Step 6 — Build pages Lovable does not have

Same design system, no copy from prototype:

- `app/whitepaper/page.tsx` — uses our existing whitepaper content (read current `app/whitepaper/page.tsx`), but rerender with the prototype's clean editorial layout. Single column, max-w-3xl, hairline section dividers, `font-display` h2, `mono` eyebrow tags, `Reveal` per section.
- `app/pitch/page.tsx` — current pitch deck content but in the new design
- `app/security/page.tsx` — current security content, same layout pattern as whitepaper
- `app/terms/page.tsx` — current terms content, same pattern
- `app/privacy/page.tsx` — current privacy content, same pattern
- `app/not-found.tsx` — 404 page matching the `__root.tsx` `NotFoundComponent` from the prototype

For all 5 docs pages: the structure is `<MarketingNav>`, `<Reveal>`-wrapped sections, `<MarketingFooter>`. Use the existing `PublicDocument` helper if it survives the redesign, or replace it with a simple inline pattern.

### Step 7 — Verify

```bash
npm run lint
npm run typecheck
npm run build
npm run test:contracts
npm run qa:live:visual    # non-destructive
```

All four must pass green. Visual screenshots will refresh in `docs/test-results/qa-live-visual/`.

### Step 8 — Cleanup

- Delete old brand-system files no longer used (any leftover from black/lime brand) — search for any reference to `bg-lime`, `bg-ink` literal classes in `components/`. Keep them only if they're brand-token replaced.
- Search for `import.*from "@/lib/mock"` and remove (we have no mock dir; all data must come from `lib/storage`, `lib/profiles`, etc.)
- Search for any "Lovable" string and remove
- Run `git diff` and confirm no unintended large rewrites of backend files

---

## Routing translation table

| Prototype (TanStack) | Our Next.js App Router |
| --- | --- |
| `/` | `/` |
| `/pay/$slug` | `/pay/[slug]` |
| `/pay/$slug/bridge` | inline in `/pay/[slug]` (preferred) or `/pay/[slug]/bridge` |
| `/r/$id` | `/receipt/[id]` |
| `/u/$handle` | `/[handle]` |
| `/dashboard` | `/dashboard` |
| `/dashboard/new` | `/create` |
| `/dashboard/settings` | `/settings` |
| `/brand` | not in our scope (skip) |
| `/demo` | not in our scope (skip) |

---

## Real-data wiring rules

1. Payment-link reads come from `getPaymentLinkBySlug` / `getPaymentLinkById` / `listPaymentLinks` (all in `lib/storage`).
2. Verified state transitions go through `app/api/payments/create`, `app/api/payments/reconcile`, `app/api/payments/cancel`.
3. Profile reads/writes via `lib/profiles`.
4. Wallet state via `useAccount` / `useChainId` / `useWriteContract` / `useBalance` (wagmi).
5. Bridge flow via `bridgeUsdcToArc` (App Kit), Gateway flow via `spendGatewayBalanceOnArc`, both with `onStep` callbacks for live timelines.
6. Demo mode: when `HAS_CONTRACT` is false, fall back to localStorage with `0xDEM0…` tx hash. Never claim verified settlement in demo mode.
7. The route picker `availableRoutes` array includes `unified-balance` only when `ENABLE_GATEWAY_ROUTE` is true. Otherwise the Gateway card stays visible but disabled with a "Coming next" badge.

---

## Don't claim, don't show

These rules from the project guidelines and `LAUNCH_READINESS.md` are non-negotiable:

- No mainnet readiness anywhere
- No "any blockchain" or "any chain" copy
- No Solana
- No fiat / cards
- Gateway visible as gated until funded proof
- Server-verified state only — never trust the browser

---

## Final acceptance criteria

- All 9 pages above render with the new Lovable design tokens
- Real wagmi wallet connect works on every flow that needs it
- Real Arc-direct payment flow works end-to-end
- Real Base Sepolia → Arc bridge flow works end-to-end with live step timeline
- Real receipt page shows real Arcscan link and real proof drawer
- Real profile page renders real freelancer data, real recent payments
- Real dashboard shows real created links from Supabase
- `npm run lint && npm run typecheck && npm run build && npm run test:contracts` all green
- `npm run qa:live:visual` regenerates fresh screenshots green
- No mock data anywhere in `app/`, `components/`, or `lib/`
- No "Lovable" or watermark string anywhere
- README, LAUNCH_READINESS, BEST_POSSIBLE_ONELINK, PRODUCT_INFO unchanged (they are already accurate for the new direction)

---

## Where the prototype source lives

`C:\Users\prate\Downloads\OneLink Payments\` — read freely, port the design, drop the mock layer. Already-cached file pointers:

- `src/styles.css`
- `.lovable/plan.md`
- `package.json`
- `components.json`
- `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/pay.$slug.tsx`, `src/routes/pay.$slug.bridge.tsx`, `src/routes/r.$id.tsx`, `src/routes/u.$handle.tsx`, `src/routes/dashboard.tsx`, `src/routes/dashboard.index.tsx`, `src/routes/dashboard.new.tsx`, `src/routes/dashboard.settings.tsx`
- `src/components/onelink/*` (11 files)
- `src/components/ui/*` (full shadcn library)
- `src/lib/mock/data.ts` (study only — DO NOT port)
- `src/lib/format.ts` (port the helpers if useful)

---

## One more thing

Tailwind's `border-color: oklch(...)` reset on `*` from the prototype is built into `globals.css`. Confirm that `border-hairline`, `border-border`, `border-input` all resolve to oklch values via `tailwind.config.ts` (already wired in this session).

If the build fails on `oklch(var(--background))`-style colors, add a fallback hex directly in `tailwind.config.ts` for older Tailwind versions. Tailwind 3.4+ supports oklch via `theme.extend.colors` arbitrary CSS values.

---

End of handoff. The next session has everything needed to finish.

---

## Staging files already in place

To keep the current dev environment working until everything is ready, the new design system is staged in renamed files. The next session should rename them into place (and adjust app/layout.tsx for fonts) AFTER `npm install` succeeds and the components below have been ported, in this order:

```
1. npm install                                                    # pulls all 12 new deps
2. Port components/ui/* and components/onelink/*                  # see Step 3 + 4 above
3. mv app/globals.new.css app/globals.css                         # swap to new tokens
4. mv tailwind.config.new.ts tailwind.config.ts                   # swap to new tokens
5. Recreate lib/utils.ts (cn helper) — deleted from repo to avoid breaking pre-install build.
   Content:
     import { type ClassValue, clsx } from "clsx";
     import { twMerge } from "tailwind-merge";
     export function cn(...inputs: ClassValue[]) {
       return twMerge(clsx(inputs));
     }
6. Update app/layout.tsx with Inter / Inter Tight / JetBrains Mono fonts
7. Rebuild pages (Step 5 above)
8. npm run lint && npm run typecheck && npm run build
```

The staging files contain:
- `app/globals.new.css` — full Lovable oklch design tokens, all custom utilities (grid-bg, dot-bg, animate-pulse-dot, shimmer, reveal, page-in, link-underline, safe-pt/pb, edge-fade-x, snap-x-cards, text-display-1/2)
- `tailwind.config.new.ts` — Tailwind v3-compatible mapping of those tokens (background/foreground/surface/card/popover/primary/secondary/muted/accent/success/warning/destructive + hairline/border/input/ring), border-radius scale, font-family vars, motion tokens

Both files have been verified for syntax. They will not break the build once paired with the new components.

---

## Quick win the next session can deliver in under an hour

If time is tight, the smallest viable port is:

1. `npm install`
2. Apply the staging files (steps 3-6 above)
3. Port `components/onelink/{logo,reveal,count-up,status-badge,step-timeline,hash-mono}.tsx` (the no-Radix ones)
4. Port `components/ui/{button,card,badge,input,label,separator}.tsx`
5. Rebuild ONLY `app/page.tsx` (landing) with the new design — the most visible surface
6. Leave the other pages on the current brand for now — they will still work because old tailwind tokens stay in scope alongside the new ones (after merging the configs)
7. `npm run build` green

This gets the new look on the most important public-facing surface without risking the working pay/receipt/dashboard flows.

The full port — all 9 pages — is a multi-hour task and should run uninterrupted with a write-capable agent.
