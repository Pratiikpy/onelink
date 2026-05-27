# OneLink Launch Readiness

Last verified: 2026-05-27

Live product: https://onelink-mauve-nu.vercel.app

Final verified Vercel deployment: `dpl_7UrkYtftTQkFXBj7ezi1XyznBV6s`

## Verdict

OneLink is ready for a professional Arc Testnet hackathon demo in the tested scope.

- Desktop and mobile web app deployed on Vercel with a polished public journey, trust center, privacy page, terms page, branded errors, and mobile-safe navigation.
- Standard invoices are registered in Supabase only after `/api/payments/create` verifies the Arc `PaymentLinkCreated` event and URL-derived link id.
- Supabase rejects anonymous standard invoice insertion; profile requests remain payer-initiated by design and unpaid profile rows are hidden from the creator dashboard.
- Final `paid` and `cancelled` states are server-written only after matching Arc events are verified.
- Direct Arc payment, WalletConnect signed payment, permanent profile payment, and Base Sepolia to Arc bridge payment are all proven on the live public deployment.
- Visual, failure-state, modal, browser-wallet, profile, cancellation, bridge, and transaction-level reports are captured under `docs/test-results/`.

This is not a mainnet readiness claim, and it is not an "any blockchain" claim. Solana and Circle Gateway checkout are outside the verified launch scope.

## Tested Scope

| Area | Status | Evidence |
| --- | --- | --- |
| Lint | Pass | `npm run lint` |
| Static TypeScript | Pass | `npm run typecheck` |
| Production build | Pass | `npm run build` |
| Solidity contract tests | Pass | `npm run test:contracts` — 27 passed |
| Supabase migrations | Pass | `initial_onelink_schema`, `tighten_payment_rls_and_function_search_path`, `require_verified_payment_cancellation`, `require_verified_invoice_creation` |
| Supabase security advisors | Pass | 0 security lints |
| Verified invoice creation | Pass | `docs/test-results/qa-live-direct/REPORT.md` proves forged anonymous invoice rejection and live `/api/payments/create` acceptance of verified Arc creation |
| Browser UI direct payment | Pass | `docs/test-results/qa-live-browser-wallet/REPORT.md` |
| Arc direct transaction proof | Pass | `docs/test-results/qa-live-direct/REPORT.md` |
| WalletConnect QR modal | Pass | `docs/test-results/qa-live-walletconnect-modal/REPORT.md` |
| WalletConnect signed Arc payment | Pass | `docs/test-results/qa-live-walletconnect-payment/REPORT.md` |
| Base Sepolia -> Arc bridge UI | Pass | `docs/test-results/qa-live-bridge-payment-ui/REPORT.md` |
| Permanent profile handle | Pass | `docs/test-results/qa-live-profile/REPORT.md` |
| Permanent profile payment | Pass | `docs/test-results/qa-live-profile-payment/REPORT.md` |
| Verified creator cancellation | Pass | `docs/test-results/qa-live-cancel/REPORT.md` |
| Failure and recovery states | Pass | `docs/test-results/qa-live-failure-states/REPORT.md` |
| Live visual smoke | Pass | `docs/test-results/qa-live-visual/REPORT.md` |
| Production dependency audit | Documented risk | `npm audit --omit=dev --json`: 39 moderate, 0 high, 0 critical; available fixes require major package changes or incompatible downgrades |

## Live Transaction Proof

### Browser UI Direct Payment

- Payment URL: https://onelink-mauve-nu.vercel.app/pay/browser-wallet-qa-20260526154443-0-02-og0FX9
- Receipt URL: https://onelink-mauve-nu.vercel.app/receipt/7e41bf18-b61c-4af2-baeb-b10f219d58e8
- Arc invoice creation: https://testnet.arcscan.app/tx/0x31010fb359a647788a44d0219756e92f9cb618117ce4352c3fed128595521d44
- Arc USDC approval: https://testnet.arcscan.app/tx/0x66a0190974dbd96424a0432e3250ec41ac1e75442f4fd3c24fde9b49b519db98
- Arc settlement: https://testnet.arcscan.app/tx/0x6b921b06d601e88cf1cdb0ea1eb5237cd89dc7220c0ef2ab6b910f46b312c4ab
- Supabase final state: `paid`, method `arc-direct`, source `Arc_Testnet`.

### Transaction-Level Direct Payment + Security Boundary

- Payment URL: https://onelink-mauve-nu.vercel.app/pay/qa-live-20260526152021
- Receipt URL: https://onelink-mauve-nu.vercel.app/receipt/c1ee1418-21a2-40bc-8ecd-bd51d3999267
- Arc invoice creation: https://testnet.arcscan.app/tx/0x2b9656b38a109c41ca3555c8a42bd58096d8354801b6029de4db222f0dab10b7
- Arc USDC approval: https://testnet.arcscan.app/tx/0x27c9fbd806de327d74422d805fc31372569ec314ef46bc9daf4405e52deda2f3
- Arc settlement: https://testnet.arcscan.app/tx/0x54117d84667f38bf4c05ead3d7baba5e18d1adcb1243ef25b4a223d2c54ba72e
- Proof: anonymous standard invoice insert was rejected; live `/api/payments/create` registered the verified invoice.

### WalletConnect Signed Payment

- Payment URL: https://onelink-mauve-nu.vercel.app/pay/walletconnect-qa-20260526152410
- Receipt URL: https://onelink-mauve-nu.vercel.app/receipt/6bd595fa-a022-4191-9920-096b552a1b30
- Arc invoice creation: https://testnet.arcscan.app/tx/0x7a8aad7f31368f9078cd74f7d949af26a6f4b75d5ec00e4dd4794788df874613
- Arc approval request: https://testnet.arcscan.app/tx/0x8a7a5883eb2f987649dfb3ce68ab58843414fef3fad0a8355c22fbf1dd5f9e97
- Arc payment request: https://testnet.arcscan.app/tx/0xc99f174e07c2329d0eb25e6aea4cde078d4812146452acb8c7b8c5d3cc038ae2
- Proof: production QR decoded, WalletKit peer paired, signed payment persisted after refresh.

### Base Sepolia -> Arc Bridge Payment

- Payment URL: https://onelink-mauve-nu.vercel.app/pay/bridge-ui-qa-20260526152945
- Receipt URL: https://onelink-mauve-nu.vercel.app/receipt/03648af0-6f4d-4ccd-930f-5feb527f5999
- Arc invoice creation: https://testnet.arcscan.app/tx/0x8e73b5abf2277a3104603c78137cbda58a172cb80540e6e48dfd79305a08ae48
- Base approval: https://sepolia.basescan.org/tx/0x27d13cda517743534fe8c455ae9f5805d9ebb8fae6ff1154b459ffed343c8e46
- Base CCTP burn: https://sepolia.basescan.org/tx/0x051298e44c02b47ddc99b708bd3060c9287bba6cc130444219b3197b7630a9db
- Arc CCTP mint: https://testnet.arcscan.app/tx/0x7631260432ac0e65428f7286bae6ee1b3a2e6a5c2e86079154027ced0e97f79d
- Arc USDC approval: https://testnet.arcscan.app/tx/0xc691611d560a299107443cac76d6165c451428200ffda81b116e766b45c120bb
- Arc settlement: https://testnet.arcscan.app/tx/0xc5ac72e58a77fd48c9f6781031557fbd63cc6c7556876f25b1bb218aea240ee3
- Supabase final state: `paid`, method `app-kit-bridge`, source `Bridged`.

### Permanent Profile Payment

- Profile URL: https://onelink-mauve-nu.vercel.app/qa-20260526152342
- Payment URL: https://onelink-mauve-nu.vercel.app/pay/qa-20260526152342-profile-payment-qa-0-02-p2qOc9
- Receipt URL: https://onelink-mauve-nu.vercel.app/receipt/985e30c5-9d0a-407c-bba5-30c64a11feb3
- Arc approval: https://testnet.arcscan.app/tx/0x16e5edd13d707b606536717d97ae202eadef3ec8eaf9d1570a4be8266553c040
- Arc profile settlement: https://testnet.arcscan.app/tx/0xfd017a9849687a854d3d45bc6e558abed8da2f63069ed7c712073a69c42d1047
- Proof: wallet-signed handle claim persisted, profile payment settled, receipt persisted after refresh.

### Verified Creator Cancellation

- Payment URL: https://onelink-mauve-nu.vercel.app/pay/cancellation-qa-20260526154353-0-01-k-7LqR
- Arc invoice creation: https://testnet.arcscan.app/tx/0xb8178553ce4b7524a238f191aefeabbee76900ea41332212f2ded57f5966df26
- Arc cancellation: https://testnet.arcscan.app/tx/0x6508d42395374f9079fdbadff8bd7d02eeadd7c9a1e94185e4e8ab841febf1fc
- Proof: forged anonymous cancellation rejected; server persisted `cancelled`; checkout visibly blocks payment.

## Visual Proof

Screenshots and transaction reports were captured from the live public deployment.

- `docs/test-results/qa-live-visual/desktop-home.png`
- `docs/test-results/qa-live-visual/desktop-create.png`
- `docs/test-results/qa-live-visual/desktop-dashboard.png`
- `docs/test-results/qa-live-visual/desktop-security.png`
- `docs/test-results/qa-live-visual/desktop-whitepaper.png`
- `docs/test-results/qa-live-visual/desktop-privacy.png`
- `docs/test-results/qa-live-visual/desktop-terms.png`
- `docs/test-results/qa-live-visual/desktop-settings.png`
- `docs/test-results/qa-live-visual/desktop-not-found.png`
- `docs/test-results/qa-live-visual/desktop-paid-link.png`
- `docs/test-results/qa-live-visual/desktop-receipt.png`
- `docs/test-results/qa-live-visual/desktop-profile.png`
- `docs/test-results/qa-live-visual/mobile-home.png`
- `docs/test-results/qa-live-visual/mobile-create.png`
- `docs/test-results/qa-live-visual/mobile-dashboard.png`
- `docs/test-results/qa-live-visual/mobile-security.png`
- `docs/test-results/qa-live-visual/mobile-whitepaper.png`
- `docs/test-results/qa-live-visual/mobile-privacy.png`
- `docs/test-results/qa-live-visual/mobile-terms.png`
- `docs/test-results/qa-live-visual/mobile-not-found.png`
- `docs/test-results/qa-live-visual/mobile-receipt.png`
- `docs/test-results/qa-live-visual/mobile-profile.png`
- `docs/test-results/qa-live-browser-wallet/`
- `docs/test-results/qa-live-walletconnect-payment/`
- `docs/test-results/qa-live-bridge-payment-ui/`
- `docs/test-results/qa-live-profile-payment/`
- `docs/test-results/qa-live-cancel/`
- `docs/test-results/qa-live-failure-states/`
- `docs/test-results/qa-live-walletconnect-modal/walletconnect-modal-mobile.png`

## Safe Product Claims

Safe claims:

- OneLink creates shareable USDC payment links.
- OneLink registers standard invoices only after verified Arc creation.
- OneLink settles verified payments on Arc Testnet.
- OneLink supports direct Arc payments.
- OneLink has proven a deployed Base Sepolia -> Arc `Bridge & pay` checkout through Circle App Kit and CCTP.
- OneLink supports permanent freelancer profile handles and has proven live payments through them.
- OneLink uses Supabase for cross-device persistence with server-side verification of invoice creation, final paid state, and final cancelled state.
- OneLink supports creator cancellation of open invoice links with Arc-event verified final state.
- OneLink presents a working WalletConnect QR flow and has proven a signed Arc payment through a compatible WalletConnect peer.

Do not claim:

- Mainnet readiness.
- Solana support.
- "Any blockchain."
- Automatic payment from arbitrary wallet funds.
- Circle Gateway route proven end-to-end.

Gateway checkout is disabled in production until a funded Circle Gateway deposit-and-spend flow is proven.

## Known Limits

| Area | Current truth |
| --- | --- |
| Mainnet | Not in scope for this submission; testnet only. |
| Solana | Not implemented. |
| Gateway | Checkout is feature-gated off; no funded Gateway balance proof has been run. |
| Additional bridge sources | Base Sepolia is launch-proven. Ethereum Sepolia, Arbitrum Sepolia, and Polygon Amoy remain beta options until each receives the same proof standard. |
| Browser wallet automation | RainbowKit/EIP-1193 UI creation and settlement and WalletConnect protocol signing are proven. A named third-party wallet application's own popup/mobile presentation is not part of the automated claim. |
| Dependency advisories | `npm audit --omit=dev` reports moderate advisories in wallet/Circle/Next transitive packages. Available automated fixes require major package changes or incompatible downgrades, so they are documented rather than forced during hackathon launch. |

## Reproduce

```bash
npm run lint
npm run typecheck
npm run build
npm run test:contracts
npm run qa:live:browser-wallet
npm run qa:live:visual
npm run qa:live:failure-states
npm run qa:live:walletconnect-modal
npm run qa:live:direct
npm run qa:live:cancel
npm run qa:live:profile
npm run qa:live:profile-payment
npm run qa:live:walletconnect-payment
npm run qa:live:bridge-payment-ui
```

## Final Submission Positioning

OneLink should be presented as:

> One payment link for supported USDC routes, settled and verified on Arc Testnet.

That statement matches the tested product and avoids overclaiming.
