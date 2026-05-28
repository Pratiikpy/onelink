# OneLink UI/UX Audit

Audit date: 2026-05-28 (re-verified after Lovable design system port and the launch-readiness pass)

Live product: https://onelink-mauve-nu.vercel.app

Verified deployment: `dpl_6CAmiBa1DNkiiw4MgkAS4TQ2T62F`

## Verdict

OneLink is presentation-ready for the current Arc Testnet hackathon scope. The product has a consistent, premium minimal interface, mobile-safe navigation, honest trust copy, verified receipt surfaces, a Linktree-style permanent profile page, and live visual proof across the core public pages at five viewport widths.

The app is not mainnet-ready. It is intentionally scoped to Arc Testnet settlement and the proven Base Sepolia → Arc CCTP bridge path.

## Surfaces Audited

| Surface | Result | Evidence |
| --- | --- | --- |
| Landing page | Pass | `docs/test-results/qa-live-visual/desktop-home.png`, `docs/test-results/qa-live-visual/mobile-home.png` |
| Create link flow | Pass | `docs/test-results/qa-live-visual/desktop-create.png`, `docs/test-results/qa-live-visual/mobile-create.png` |
| Links dashboard | Pass | `docs/test-results/qa-live-visual/desktop-dashboard.png`, `docs/test-results/qa-live-visual/mobile-dashboard.png`, `docs/test-results/qa-live-cancel/dashboard-cancelled.png` |
| Checkout | Pass | `docs/test-results/qa-live-visual/desktop-paid-link.png`, `docs/test-results/qa-live-cancel/checkout-cancelled.png` |
| Receipt | Pass | `docs/test-results/qa-live-visual/desktop-receipt.png`, `docs/test-results/qa-live-visual/mobile-receipt.png` |
| Profile payment page | Pass | `docs/test-results/qa-live-visual/desktop-profile.png`, `docs/test-results/qa-live-visual/mobile-profile.png` |
| Security/trust pages | Pass | `docs/test-results/qa-live-visual/desktop-security.png`, `docs/test-results/qa-live-visual/mobile-security.png` |
| Privacy, terms, settings, not found | Pass | `docs/test-results/qa-live-visual/REPORT.md` |

## Fixes Applied

| Issue | Fix |
| --- | --- |
| Checkout memo text could overflow on narrow cards when a payer opens a link with a long invoice memo. | Memo text now wraps with `break-words` and stable line height. |
| Dashboard desktop table depended on a wide six-column layout, which made the page easier to clip on medium screens. | Dashboard now uses a more compact five-column table, places amount under the memo, and switches to card layout below `lg`. |
| Hero copy is now scoped to a single direct headline ("Get paid in USDC. One link.") with a muted second line, an explicit "LIVE ON ARC TESTNET · USDC NATIVE" eyebrow, and a 4-stat strip pinning settlement chain, native gas, bridge route, and routes proven live. | Confirmed in `docs/test-results/qa-live-visual/desktop-home.png`. |
| Permanent profile page felt functional but not premium enough for a shareable freelancer page. | Profile pages now include avatar initials, display name, handle copy action, proof cards, route status, Gateway gating, amount presets, and memo presets. |
| Gateway wording could imply a complete unified-balance checkout. | Gateway is now explicitly shown as hidden/gated until funded deposit, burn, and mint proof exists. |

## Verification

Commands run (2026-05-28):

```bash
npm run lint
npm run typecheck
npm run build
node scripts/qa-launch-readiness.mjs
node scripts/qa-live-visual.mjs
node scripts/qa-live-cancel.mjs
```

Live QA results:

| Check | Result | Report |
| --- | --- | --- |
| Launch-readiness sweep (5 viewports × 10 routes) | Pass · 50/50 green | `docs/test-results/qa-launch-readiness/REPORT.md` |
| Visual smoke across desktop and mobile pages | Pass | `docs/test-results/qa-live-visual/REPORT.md` |
| Expanded profile visual QA at 390, 768, 1366, 1440, and 1920 px | Pass | `docs/test-results/qa-live-visual/REPORT.md` |
| Verified creator cancellation (with new ConfirmDialog) and dashboard state | Pass | `docs/test-results/qa-live-cancel/REPORT.md` |

Latest cancellation transaction (2026-05-28):

https://testnet.arcscan.app/tx/0x9a7d08580a5313cb97220c21e2011d6f042cc0c6db0349d75a4cafc46bdc5138

## Remaining Product Limits

These are not UI bugs; they are honest product-scope limits:

| Limit | Current status |
| --- | --- |
| Mainnet payments | Not claimed. Current deployment is testnet only. |
| Solana route | Not implemented in this launch scope. |
| Circle Gateway unified-balance checkout | Disabled until the funded Gateway flow is separately proven end to end. |
| Fiat/card payment | Not supported. |
| Third-party wallet popup visual QA | Browser wallet and WalletConnect protocol flows are automated; named third-party app-specific popup skins are not a product claim. |
