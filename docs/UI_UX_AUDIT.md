# OneLink UI/UX Audit

Audit date: 2026-05-27

Live product: https://onelink-mauve-nu.vercel.app

Verified deployment: `dpl_6CAmiBa1DNkiiw4MgkAS4TQ2T62F`

## Verdict

OneLink is presentation-ready for the current Arc Testnet hackathon scope. The product now has a consistent premium dark interface, mobile-safe navigation, honest trust copy, verified receipt surfaces, a Linktree-style permanent profile page, and live visual proof across the core public pages.

The app should not be described as mainnet-ready or "any blockchain" ready. The UI is intentionally scoped to verified Arc Testnet settlement and the proven Base Sepolia to Arc bridge path.

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
| Hero line "Supported USDC" read awkwardly and was less precise than the actual product scope. | Hero copy now says "USDC routes" while the paragraph keeps the verified Arc/Base Sepolia scope explicit. |
| Permanent profile page felt functional but not premium enough for a shareable freelancer page. | Profile pages now include avatar initials, display name, handle copy action, proof cards, route status, Gateway gating, amount presets, and memo presets. |
| Gateway wording could imply a complete unified-balance checkout. | Gateway is now explicitly shown as hidden/gated until funded deposit, burn, and mint proof exists. |

## Verification

Commands run:

```bash
npm run lint
npm run typecheck
npm run build
npm run qa:live:visual
npm run qa:live:cancel
```

Live QA results:

| Check | Result | Report |
| --- | --- | --- |
| Visual smoke across desktop and mobile pages | Pass | `docs/test-results/qa-live-visual/REPORT.md` |
| Expanded profile visual QA at 390, 768, 1366, 1440, and 1920 px | Pass | `docs/test-results/qa-live-visual/REPORT.md` |
| Verified creator cancellation and dashboard state | Pass | `docs/test-results/qa-live-cancel/REPORT.md` |

Latest cancellation transaction:

https://testnet.arcscan.app/tx/0xc58efdfd79cc19b1ceea3e80282640e86dcc64d31e9612a84a61b0880c2cd810

## Remaining Product Limits

These are not UI bugs; they are honest product-scope limits:

| Limit | Current status |
| --- | --- |
| Mainnet payments | Not claimed. Current deployment is testnet only. |
| Solana route | Not implemented in this launch scope. |
| Circle Gateway unified-balance checkout | Disabled until the funded Gateway flow is separately proven end to end. |
| Fiat/card payment | Not supported. |
| Third-party wallet popup visual QA | Browser wallet and WalletConnect protocol flows are automated; named third-party app-specific popup skins are not a product claim. |
