# OneLink Hackathon Working Document

> One link. Supported USDC routes. Verified on Arc.

**Live app:** https://onelink-mauve-nu.vercel.app  
**Pitch page:** https://onelink-mauve-nu.vercel.app/pitch  
**Whitepaper:** https://onelink-mauve-nu.vercel.app/whitepaper  
**GitHub:** https://github.com/Pratiikpy/onelink  
**Launch readiness:** https://github.com/Pratiikpy/onelink/blob/main/docs/LAUNCH_READINESS.md

---

## 1. Product Snapshot

OneLink is a premium USDC payment-link product for freelancers and independent service providers.

Instead of asking a client which chain, wallet, or address format they use, the freelancer shares one professional payment page. The client pays through a supported route, and OneLink verifies the payment on Arc Testnet before showing a receipt.

**Positioning line:**

> One payment link for supported USDC routes, settled and verified on Arc Testnet.

**Important scope clarity:**

- OneLink is not claiming mainnet readiness yet.
- OneLink is not claiming support for every blockchain yet.
- Solana and Circle Gateway checkout are not presented as live scope.
- The current submission scope is verified testnet functionality with real transaction proof.

---

## 2. The Problem

Freelancers and clients already use stablecoins, but payment coordination is still messy.

A normal crypto invoice can turn into a support conversation:

- Which wallet do you use?
- Which chain should I send on?
- Is this native USDC or bridged USDC?
- Did you send it to the right address?
- Can you send me the transaction screenshot?

This creates friction, trust issues, and a less professional client experience.

**Core pain:**

> Crypto payments are technically powerful, but the user experience still feels like sending instructions in a chat thread.

---

## 3. The Solution

OneLink turns that fragmented experience into one polished payment page.

**Freelancer flow:**

1. Create a payment link or profile payment preset.
2. Share the OneLink URL with a client.
3. Client opens the page and connects a wallet.
4. Client pays through a supported route.
5. OneLink verifies the transaction and shows a professional receipt.

**Client experience:**

- Clear invoice amount.
- Clear recipient context.
- Supported wallet/payment route.
- Verified paid state.
- Receipt with onchain proof.

**Why it matters:**

OneLink makes stablecoin payments feel closer to a professional checkout page, not a chain-support conversation.

---

## 4. Visual Proof To Add In Notion

Use these screenshots from the repository when building the Notion page.

### Hero / Landing Page

Add this as the first large visual.

`docs/screenshots/home-desktop.png`

Suggested caption:

> OneLink landing page: premium black/lime visual system, clear Arc Testnet scope, and direct path to create a payment link.

### Mobile Landing Page

`docs/screenshots/home-mobile.png`

Suggested caption:

> Mobile-first experience verified at narrow screen width.

### Payment Checkout

`docs/screenshots/pay-unpaid-desktop.png`

Suggested caption:

> Payment checkout page before settlement.

### Verified Receipt

`docs/screenshots/receipt-paid-desktop.png`

Suggested caption:

> Receipt view after successful verified payment.

### Profile Page

`docs/screenshots/profile-desktop.png`

Suggested caption:

> Linktree-style freelancer profile page for shareable payment presets.

### Whitepaper Page

`docs/screenshots/whitepaper-desktop.png`

Suggested caption:

> Judge-facing whitepaper page explaining product thesis, Arc/Circle usage, and verified scope.

### WalletConnect Flow

`docs/test-results/qa-live-walletconnect-payment/walletconnect-qr-modal.png`

Suggested caption:

> WalletConnect QR flow tested on the live public deployment.

### Bridge Route UI

`docs/test-results/qa-live-bridge-payment-ui/bridge-route-selected.png`

Suggested caption:

> Base Sepolia to Arc bridge route UI using Circle CCTP/App Kit scope.

---

## 5. What We Built Today

Today we worked on making OneLink more launch-ready and judge-ready for the OpenAI x Outskill Hackathon.

**Product and UI/UX:**

- Improved the product experience to feel more premium, professional, and consistent.
- Refined the public landing page, payment flow, profile/payment link experience, whitepaper, and pitch page.
- Added a professional in-app pitch page at `/pitch`.
- Added a technical whitepaper page explaining OneLink, Arc, Circle, supported routes, and launch scope.
- Improved mobile responsiveness and visual consistency across core pages.

**Product functionality:**

- Verified payment links.
- Verified receipts.
- Permanent freelancer profile/payment page flow.
- Wallet connection UI.
- WalletConnect payment path.
- Direct Arc Testnet settlement path.
- Base Sepolia to Arc bridge UI path through Circle CCTP/App Kit scope.
- Creator cancellation state.
- Failure states such as expired, missing, insufficient funds, and rejected wallet action.

**Engineering quality:**

- Improved README and launch documentation.
- Added or refined security, support, contribution, code of conduct, launch-readiness, UI/UX audit, and pitch documentation.
- Protected GitHub `main` branch with required checks.
- Verified app build, lint/typecheck, contract tests, CodeQL, and Vercel deployment.
- Confirmed open CodeQL, Dependabot, and secret-scanning alerts are zero.

---

## 6. Current Verified Scope

| Area | Status |
| --- | --- |
| Live Vercel app | Verified |
| Arc Testnet direct payment | Live-proven |
| WalletConnect signed payment | Live-proven |
| Base Sepolia to Arc bridge route | Live-proven in current supported scope |
| Verified receipts | Live-proven |
| Permanent profile payment flow | Live-proven |
| Creator cancellation | Live-proven |
| Failure states | Tested |
| Mobile/tablet/desktop responsiveness | Tested |
| GitHub CI and CodeQL | Green |
| Open security alerts | Zero |
| Solana | Not implemented yet |
| Circle Gateway checkout | Disabled until funded end-to-end flow is proven |
| Mainnet | Not claimed |

---

## 7. Arc and Circle Usage

OneLink uses Arc as the settlement and proof layer for the current launch scope.

**Arc:**

- Arc Testnet settlement contract.
- USDC-first payment experience.
- Verified transaction proof for receipts.
- Fast testnet confirmation flow suitable for demo and judging.

**Circle:**

- USDC payment routing focus.
- Circle CCTP/App Kit route for Base Sepolia to Arc flow.
- Circle ecosystem alignment for cross-chain stablecoin UX.
- Gateway is intentionally not claimed as live until a complete funded deposit/spend flow is proven.

**Why this is important:**

The product is not just a design mockup. The core submission is backed by real transaction evidence, contract tests, live deployment checks, and documented scope.

---

## 8. QA And Launch Proof

OneLink has launch-readiness proof documented in the repository.

**Main proof links:**

- Launch readiness: https://github.com/Pratiikpy/onelink/blob/main/docs/LAUNCH_READINESS.md
- UI/UX audit: https://github.com/Pratiikpy/onelink/blob/main/docs/UI_UX_AUDIT.md
- Security review: https://github.com/Pratiikpy/onelink/blob/main/docs/SECURITY_REVIEW.md
- README: https://github.com/Pratiikpy/onelink

**QA evidence includes:**

- Direct payment flow.
- WalletConnect payment flow.
- Bridge payment UI flow.
- Profile payment flow.
- Cancellation flow.
- Failure states.
- Visual QA across mobile, tablet, laptop, desktop, and wide screens.

---

## 9. Demo Script For Judges

**30-second demo:**

1. Open the OneLink landing page.
2. Show the freelancer profile page.
3. Open a payment link.
4. Connect wallet / show WalletConnect path.
5. Complete or show verified payment state.
6. Open the receipt page with transaction proof.
7. Show launch readiness documentation.

**One-line explanation:**

> OneLink lets a freelancer share one payment page, lets a client pay through a supported USDC route, and verifies final settlement on Arc before showing a receipt.

---

## 10. What Is Left After This Checkpoint

These are future improvements, not current submission claims.

- Add full Circle Gateway unified-balance checkout after funded Gateway flow is proven.
- Expand supported chain coverage beyond the current verified EVM testnet scope.
- Add Solana route after implementation and live testing.
- Add production mainnet deployment after audits, monitoring, and real operational controls.
- Add more profile customization for freelancers.
- Add invoice history, export, analytics, and recurring payment flows.

---

## 11. Daily Progress Form Copy

Use this in the hackathon daily progress form.

```text
Today I worked on making OneLink more launch-ready for the OpenAI x Outskill Hackathon.

Progress completed:
- Improved the product UI/UX to feel more premium, professional, and consistent across the app.
- Refined the public landing page, payment flow, profile/payment link experience, whitepaper, and pitch page.
- Added a professional in-app pitch deck page at /pitch.
- Added a technical whitepaper page explaining OneLink, Arc, Circle, supported payment routes, and current scope.
- Improved README and launch documentation so the GitHub repo looks submission-ready.
- Added/updated security, support, contribution, code of conduct, launch-readiness, and UI/UX audit documents.
- Verified the production app on Vercel.
- Tested responsive layout across mobile, tablet, laptop, desktop, and wide screens.
- Verified live payment-related flows including payment links, receipts, wallet connection UI, cancellation states, profile page flow, and failure states.
- Verified Arc Testnet settlement path and Base Sepolia bridge UI path within the current supported testnet scope.
- Ran app quality checks: lint, typecheck, production build, contract tests, CodeQL, and GitHub CI.
- Confirmed GitHub security posture is clean with zero open CodeQL, Dependabot, and secret-scanning alerts.
- Protected the GitHub main branch with required checks so the repo looks more professional and safer.
- Deployed the latest production version to Vercel.

Current progress:
OneLink is now a working, polished, testnet-ready product with a professional user flow, public documentation, launch-readiness proof, security posture, and a clear pitch narrative for judges.
```

---

## 12. Final Submission Angle

OneLink should be presented as a working product, not just an idea.

**Strongest narrative:**

> We started with a simple freelancer pain point: crypto payments break when the client and freelancer are on different wallets or chains. OneLink turns that into a premium payment-link experience with supported USDC routes, Arc-verified settlement, professional receipts, and proof-first launch documentation.

**Judge takeaway:**

- The product solves a real workflow problem.
- The UI feels polished enough to trust.
- The technical scope is honest and verified.
- Arc and Circle are used where they matter.
- The repo and deployment are professionally prepared.
