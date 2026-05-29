# OneLink — Final UI/UX Audit

_Captured against `https://onelink-mauve-nu.vercel.app` after the Reveal opacity hotfix (commit `045913a`)._
_Reviewed: 15 page labels × desktop (1440 × 900) + mobile (390 × 844). Audit script: `scripts/audit-viewports.mjs`._

> **⚠️ Superseded by the v2 fintech-blue redesign (PR #35, 2026-05-29).** This audit records the *pre-v2* Lovable theme — Inter Tight headlines, off-white `#fbfbf8`, and lime accents. The shipped product now uses the **Geist** type family and a single **confident blue `#1E50E5`** brand on a warm-white canvas. See `app/brand/page.tsx` for the canonical current brand. The findings below are retained as a historical snapshot.

---

## TL;DR

**The product looks editorial-grade premium across every shipped surface.** The Lovable Apple-minimal theme reads correctly (Inter Tight headlines, off-white #fbfbf8 background, hairline borders, near-black foreground), and after the Reveal-opacity hotfix the landing page no longer has invisible sections. Remaining work is micro-polish, not structural.

The single most visible improvement target: the receipt page on mobile has a long server-verification pill (`Server-verified against PaymentCompleted event · View proof →`) that wraps awkwardly across three visual lines at 390 px. Loosening the layout to stack the action below the message would fix it.

---

## Critical (must fix before share)

_None._ The Reveal opacity bug was the only ship-blocker, and it's fixed and live.

---

## Medium (visible polish)

### M-1 · Receipt mobile · Server-verification pill wraps to three lines
**Page · viewport:** `/receipt/[id]` · 390 px
**Finding:** "Server-verified against PaymentCompleted event" + "View proof →" is laid out side-by-side in a single pill. On mobile the long left label wraps to two lines, then "View proof →" gets pushed to a third visual line with the arrow on its own line.
**Fix:** Stack on `< sm`. Either use `flex-col sm:flex-row` with the action button below the message, or shorten the label to `Server-verified · PaymentCompleted` and keep the action inline.

### M-2 · Pay & Receipt · Amount unit overlaps the decimal
**Page · viewport:** `/pay/[slug]` and `/receipt/[id]` · both viewports
**Finding:** The amount renders as `0.25` with `USDC` placed as a small superscript whose left edge sits inside the trailing pixel of the `5`. Not broken, but visually crowded — the eye reads it as `0.25usdc` for a half-second.
**Fix:** Add `ml-1.5` (currently the gap relies on optical kerning) or move `USDC` to a baseline-aligned label one font step smaller.

### M-3 · Settings mobile · Tab row crowds at 390 px
**Page · viewport:** `/settings` · 390 px
**Finding:** Tabs `Profile · Wallet · Network · Danger zone` sit in a single horizontal row. "Danger zone" is the longest label and the row uses ~350 px of the 390 px width — comfortable but with no horizontal padding to the page edge feeling.
**Fix:** Either make the tab row horizontally scrollable with edge-fade (`snap-x-cards` / `edge-fade-x` utilities already exist in `globals.css`), or shorten "Danger zone" → "Danger" on `< sm` only.

### M-4 · Marketing pages · Below-hero whitespace before next section
**Page · viewport:** `/`, `/whitepaper`, `/security` · desktop
**Finding:** Now that the Reveal sections are visible, the rhythm between the hero and the first content section has ~140 px of empty space which feels luxe but slightly slack, especially on the 1440 × 900 viewport where the next section sits below the fold.
**Fix:** Trim to `pb-24 md:pb-28` (currently `pb-28 md:pb-36`). Saves ~50 px and lets one more proof element peek above the fold on standard laptops.

---

## Low (nice-to-have)

### L-1 · `/not-found` reads as a profile-not-found, not a global 404
**Page · viewport:** `/<unknown-handle>` · both
**Finding:** The catch-all `[handle]` route renders a "Link not found / This permanent payment link is not active" card for any unknown URL, including typos that aren't intended as profile handles. Correct copy for handle lookups, slightly off for plain wrong URLs.
**Fix:** Differentiate between "looked like a handle but doesn't exist" and "this URL doesn't exist anywhere" by checking the slug shape (alphanumeric, length 3–32) before showing the profile-flavored message. Out of scope is fine — current copy is acceptable.

### L-2 · Dashboard empty state is centered vertically but the page is tall
**Page · viewport:** `/dashboard` · desktop
**Finding:** The "Connect your wallet to see your links" empty state sits at ~30 % page height with no other content. Lots of whitespace below.
**Fix:** Either pull it up with `pt-16` instead of vertical centering, or add a single muted footer hint like "Once connected, your links and revenue summary appear here." to fill the space without selling.

### L-3 · Mobile nav: hamburger is a 40 × 40 circle outline
**Page · viewport:** every page · mobile
**Finding:** The hamburger sits at the top-right inside a circle outline. Tap target is fine (≥ 40 px) but the circle outline is the only filled-stroke element on otherwise hairline pages, drawing more eye than necessary.
**Fix:** Drop the outline circle; show just the icon with `p-2` so it has tap target without the visible boundary. Or keep the circle but use `border-hairline` instead of `border-border`.

### L-4 · `/brand` color cards · `hairline` swatch is invisible
**Page · viewport:** `/brand` · both
**Finding:** The hairline color token is intentionally `oklch(0.16 0.004 260 / 0.07)` — a near-transparent line. In its color card swatch, the `bg-background` body + thin border results in a swatch that looks empty at a glance; the user has to read the role label to understand what's being shown.
**Fix:** Render the hairline swatch as a single 1 px line on a muted background (e.g., `bg-muted/40` with a centered `border-t border-hairline` strip 60 % wide) so the swatch literally shows the hairline.

---

## Polish (delight tier)

### P-1 · Pay-link header recipient avatar
The `8` numeric badge next to `0x8fD0...EcdB requested` on the pay page is functional but generic. Swap to a deterministic identicon (jdenticon or boring-avatars seeded by address) so each recipient has a unique identity glyph. ~12 lines, no new dependencies if we hand-roll a tiny SVG hash-to-pattern.

### P-2 · Settlement contract row at landing footer
The settlement contract (`0x9b7D5B4DAD4c9B1065908FA8C6C34d697E3cBD0c` on Arc Testnet, configured via `NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS`) renders in mono with no copy-on-click affordance. Add the same copy icon used on `/receipt`, plus a tiny tooltip "Read on Arcscan →" that opens the Arc explorer. (The zero address / demo mode applies only when the env var is unset.)

### P-3 · Profile page send-USDC card auto-focus
On `/<handle>`, the `0` amount input doesn't auto-focus on mount. A payer's first interaction is always to type an amount. `autoFocus` on the input would shave a tap.

### P-4 · Reveal animation duration on slow devices
Current `480ms` cubic-bezier is calm. On 60 Hz mobile the cascade across the hero (mono eyebrow → headline → subhead → CTA → stats) feels cohesive. On slower Android devices the cascade can stretch to ~1.4 s end-to-end. Consider clamping the inter-element delay to `0` for `prefers-reduced-data` clients (treat reduced-data as a perf hint).

### P-5 · Brand kit · Add download links for Logo SVG/PNG
`/brand` shows the mark/lockup/stacked variants but doesn't provide a download button. A small `Download SVG` / `Download PNG@2x` link below each lockup would make the page properly useful for partners.

---

## Page-by-page notes

### `/` Landing
- **Desktop:** Editorial. Hero, stats strip, product canvas, how-it-works, routes, built-on, pricing, FAQ, settlement-contract row, footer all render at full opacity (post-fix). Long page; ~5500 px scroll height.
- **Mobile:** Sections stack cleanly. Hero headline `Get paid in USDC. One link.` wraps gracefully. Stats strip becomes a 2-column grid. CTA group stays inline.

### `/create`
- **Desktop:** Wallet-disconnected empty state. "Connect a wallet to begin" feels intentional, not empty.
- **Mobile:** Same content stacked. Hamburger nav top-right.

### `/pay/[slug]` (paid state)
- **Desktop:** Single centered card with `Amount due / Paid` pill + `View receipt →` CTA. Premium, focused.
- **Mobile:** Same card vertical-centered. See M-2 on amount unit kerning.

### `/receipt/[id]`
- **Desktop:** Best surface in the product. Verified-on-Arc badge, amount, memo, justified detail rows, server-verified pill, action row (Arcscan, Copy URL), Share receipt CTA, receipt ID footnote. Reads like a Stripe payout receipt.
- **Mobile:** All info preserved. See M-1 on the verification pill wrapping.

### `/<handle>` Profile
- **Desktop:** Cover band + monogram + bio + stacked Network/Wallet/Routes cards + Send-USDC card with quick amounts and tag chips.
- **Mobile:** Same content, single column. Quick-amount chips (25/100/250) sit on a single row at 390 px. Tag chips (Invoice/Retainer/Milestone) clean.

### `/dashboard`
- **Desktop:** Disconnected empty state. Once connected: KPI sparkline + tabs + search + table.
- **Mobile:** See L-2 on whitespace below empty state.

### `/settings`
- **Desktop:** `SETTINGS · Account` headline + 4-tab sidebar/strip (Profile, Wallet, Network, Danger zone). Right pane shows the active tab's content card.
- **Mobile:** Tabs collapse to horizontal row above the card. See M-3 on tab crowding.

### `/whitepaper`, `/pitch`, `/security`, `/privacy`, `/terms`
- **Desktop:** Long-form editorial pages. MarketingNav + body + MarketingFooter. Reveal-on-scroll fade-in across sections. Type hierarchy correct.
- **Mobile:** Same flow. Headline tracking holds at narrow widths thanks to `text-balance`.

### `/brand`
- **Desktop:** Logo (3 sizes + 3 variants), Color (9 tokens with oklch+hex+role), Typography (6 type cards), Spacing (6 radii), Elevation (2 cards), Motion (3 durations), Iconography, Voice. ~2600 px scroll.
- **Mobile:** Stacks into single column. Color grid goes 1-up at narrow widths.

### `/not-found` (catch-all)
- **Desktop:** Centered profile-style empty state with `Create a payment link` CTA. See L-1 on copy specificity.
- **Mobile:** Same content. Acceptable.

---

## What looks great

- **The receipt page.** It is the most polished surface — quiet authority, every detail a reviewer needs, and the proof drawer + Arcscan/Copy/Share row reads like a fintech-grade payout receipt.
- **Type hierarchy.** Inter Tight + Inter pairing reads editorial across all viewports. Display-1 (`Get paid in USDC. One link.`) lands the brand voice instantly.
- **Mono labels.** The all-caps tracking-0.22em `· LIVE ON ARC TESTNET ·` eyebrow and the JetBrains Mono hash treatment together do more brand-signaling work than any logo.
- **Hairline borders.** Almost no shadows, no gradient fills, no decorative chrome. The system trusts whitespace and 1 px lines, and it works.
- **Profile send card.** The combination of huge editorial amount input + 25/100/250 chips + Invoice/Retainer/Milestone tag chips + Settled-on-Arc footnote is the single best mobile-first surface in the product.
- **Brand kit page.** Now that it exists, it serves both as designer reference and as proof that the team has a real design system, not just a stylesheet.

---

## Verification status (post-audit)

| Check | Result |
|---|---|
| Reveal opacity fix deployed | ✅ Live CSS has `.reveal { opacity: 1 }` (verified by fetching `_next/static/css/*.css`) |
| `/brand` route shipped | ✅ HTTP 200, 81 KB, "OneLink design system" text present |
| `npm run lint` | ✅ 0 errors |
| `npm run typecheck` | ✅ 0 errors |
| `npm run build` | ✅ 24 routes, all green (was 23 — added `/brand`) |
| `npm run test:contracts` | ✅ 27 / 27 forge tests passing |
| Vercel deployment | ✅ Auto-deployed against `main` |

_Report produced 2026-05-28 by the Kiro CLI agent._
