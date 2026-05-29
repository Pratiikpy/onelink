# OneLink Pitch Deck Brief

## Purpose

Create a premium 4-slide pitch deck for the OpenAI x Outskill AI Builders Hackathon.
The deck should feel like a real fintech/Web3 product launch, not a generic hackathon presentation.
It must match OneLink's v2 brand system: a warm-white editorial canvas, near-black ink, one confident blue (`#1E50E5`) proof accent,
large confident typography, polished product screenshots, and precise claims.

The deck should help judges understand three things fast:

1. The payment problem is real and painful.
2. OneLink solves it with one professional freelancer payment page.
3. The current product is live-tested with real Arc/Circle proof in a clearly stated testnet scope.

## Product Positioning

OneLink is a premium USDC payment link and profile page for freelancers.

Freelancers share one link. Clients pay through supported USDC routes. The payment is settled and verified on Arc Testnet, and the payer/freelancer gets a receipt backed by onchain proof.

### Core Line

One link. Supported USDC routes. Verified on Arc.

### Expanded Line

OneLink turns fragmented stablecoin payments into a professional payment page for freelancers: one profile, supported USDC routes, server-verified settlement, and receipt proof.

### What We Can Claim

- Premium payment links and freelancer profile pages.
- Arc Testnet settlement is live-proven.
- WalletConnect payment flow is live-proven.
- Permanent profile payment flow is live-proven.
- Base Sepolia to Arc CCTP route is live-proven.
- Final paid/cancelled states are server-verified before being stored.
- GitHub is professionally hardened: CI, CodeQL, branch protection, secret scanning, Dependabot, support/security docs.

### What We Must Not Claim

- Any blockchain.
- All wallets.
- Mainnet readiness.
- Solana support.
- Fiat/card support.
- Circle Gateway is live.
- Instant payment from arbitrary funds on arbitrary chains.

Use "supported USDC routes" instead of "any chain".
Use "Arc Testnet" instead of "mainnet".
Use "Gateway planned / disabled until proven" if Gateway is mentioned.

## Visual Direction

### Brand Feel

- Premium fintech.
- Linktree-level shareability.
- Stripe-level trust language.
- Crypto proof without looking like a crypto casino.
- High-contrast, editorial, minimal, confident.

### Colors

- Background: warm white, `#FBFBF8` (near-black ink `#0D0F12` for marks/fills).
- Accent: confident blue, `#1E50E5` (tint `#EDF1FE`, deep `#1742C4`); USDC blue `#2775CA`.
- Text: near-black ink, `#0D0F12`.
- Muted text: cool gray.
- Surfaces: white cards with hairline borders.

### Typography

- Large, bold hero typography set in **Geist Sans**; hashes and amounts in **Geist Mono**.
- Very short titles.
- Avoid tiny crowded text.
- Each slide should be readable in 5 seconds.

### Graphic Elements

- Use real product screenshots whenever possible.
- Use transaction/proof cards, not decorative crypto icons.
- Use small proof badges: `Live Arc proof`, `CCTP route`, `WalletConnect`, `0 open alerts`, `Green CI`.
- Use subtle grid/noise/radial glow, not heavy gradients.

## Deck Structure

The official requirement is 4 slides:

1. Problem / pain point.
2. Solution and key features.
3. Tools / tech stack.
4. ICP / target audience.

The deck should satisfy that, but make each slide stronger than a checklist.

---

# Slide 1 — Problem

## Title

Freelancer payments break at the chain step.

## Subtitle

Stablecoins are global, but the payment experience is still fragmented.

## Main Narrative

Freelancers work with clients across countries, wallets, and chains. The moment payment starts, the conversation becomes operational instead of professional:

- Which wallet do you use?
- Which chain should I send on?
- Is this USDC on Base, Ethereum, Polygon, Arbitrum, or something else?
- What if the client sends to the wrong network?
- How does the freelancer prove the payment was completed?

This makes crypto payments feel less professional than a Stripe, PayPal, or Linktree-style payment page.

## Pain Points

- Freelancers send different wallet addresses for different chains.
- Clients already holding USDC still get stuck choosing the right route.
- Payment conversations become technical support.
- Mistakes cause delayed or failed payments.
- There is no polished, shareable crypto payment page built for service providers.

## Punchline

Crypto payments are powerful. The freelancer checkout experience is still broken.

## Visual Suggestion

Left side: huge title.
Right side: messy chat/payment friction visual, for example:

- Small stacked message bubbles:
  - "Which chain?"
  - "Can I send from Base?"
  - "Is this ERC-20?"
  - "Do you have another wallet?"
- Then contrast with a clean empty OneLink card silhouette.

## Speaker Note

The problem is not limited to India. It is global. Any freelancer working with international clients can face this. India is a strong initial market because cross-border payments are painful, but the product is for global freelancers.

---

# Slide 2 — Solution

## Title

One payment page. Supported USDC routes. Verified receipt.

## Subtitle

OneLink gives freelancers a shareable payment profile and invoice links that feel client-ready.

## Main Narrative

OneLink replaces chain confusion with a single professional payment page.

A freelancer creates a profile or invoice link. The client opens it, reviews the amount and memo, chooses a supported USDC route, connects their wallet, pays, and receives a verified receipt.

The freelancer does not need to explain chains, addresses, or settlement details in every client conversation.

## Key Features

- Permanent freelancer profile: `/{handle}`.
- One-time invoice links for specific jobs.
- Amount and memo presets for fast payment requests.
- Supported route selection with honest testnet language.
- Arc Testnet receipt with transaction proof.
- Server-side reconciliation before final paid state.
- Premium Linktree-style page clients can trust.

## User Flow

1. Freelancer shares one OneLink profile or invoice URL.
2. Client opens the page and reviews payment details.
3. Client pays through a supported USDC route.
4. OneLink verifies the onchain event.
5. Receipt page shows proof and final state.

## Punchline

No chain confusion. No address back-and-forth. Just one verified payment link.

## Visual Suggestion

Use actual product screenshots:

- Mobile profile page screenshot as the hero.
- Small checkout card showing `250.00 USDC`.
- Small receipt card with `Verified` or `Paid` badge.
- Flow line: `Profile -> Checkout -> Arc receipt`.

---

# Slide 3 — Tech Stack & Proof

## Title

Built on Arc and Circle with proof-first engineering.

## Subtitle

OneLink is not just a UI mockup. The tested scope is live, verified, and documented.

## Main Narrative

OneLink uses Arc as the settlement layer and Circle infrastructure for supported USDC routing. The app records final payment state only after verification, not just after a frontend click.

This matters because payment products need trust. A nice UI is not enough. Judges should see that OneLink has real transaction evidence, server-side reconciliation, and professional repository controls.

## Stack

- Arc Testnet — USDC-first settlement layer.
- Circle CCTP / App Kit — Base Sepolia to Arc bridge route.
- WalletConnect + RainbowKit — wallet connection and signing.
- Solidity + Foundry — OneLinkCollect settlement contract.
- Supabase — profile handles, payment metadata, verified state.
- Next.js + TypeScript — product frontend and API routes.
- GitHub CI + CodeQL — quality and security gates.

## Live Proof

- Arc direct payment: live-proven.
- WalletConnect signed payment: live-proven.
- Permanent profile payment: live-proven.
- Base Sepolia to Arc CCTP payment route: live-proven.
- Responsive QA: 390, 768, 1366, 1440, and 1920 widths.
- Code/security posture: 0 open CodeQL, Dependabot, and secret-scanning alerts.

## Punchline

Every final paid state is backed by verified onchain proof, not frontend trust.

## Visual Suggestion

Use a dark architecture diagram with four columns:

1. Client wallet.
2. Circle route / CCTP.
3. Arc settlement contract.
4. Supabase + receipt.

Add proof badges:

- `Green CI`
- `CodeQL passed`
- `0 open alerts`
- `Live tx hashes`

Include 1-2 tiny transaction hash rows, but do not overcrowd.

---

# Slide 4 — ICP & Why Now

## Title

For freelancers who want crypto payments to feel professional.

## Subtitle

Stablecoin payments are growing, but service-provider checkout has not caught up.

## Primary ICP

Freelancers, consultants, creators, and small agencies who work with clients globally and want to accept USDC without explaining wallet networks and payment routes every time.

## Target Segments

- Web3 freelancers paid in USDC.
- Designers, developers, and product consultants billing international clients.
- Creators selling services, audits, templates, or digital work.
- Small agencies managing project-based invoices.
- Remote professionals in markets where cross-border payments are slow, expensive, or unreliable.

## Why Now

- More clients already hold USDC across multiple chains.
- Stablecoin payments are becoming normal for global work.
- Arc makes USDC-first settlement feel fast and predictable.
- Circle infrastructure makes supported cross-chain USDC routing more practical.
- Freelancers need a payment surface that feels as simple as sharing a profile link.

## Go-To-Market Angle

Start with Web3-native freelancers because they already understand USDC but still suffer from route fragmentation. Expand toward global freelancers who want stablecoin payments without crypto UX complexity.

## Punchline

OneLink makes stablecoin payments feel client-ready.

## Visual Suggestion

Use a clean ICP grid:

- Web3 freelancers.
- Consultants.
- Creators.
- Small agencies.

Each card should show:

- User type.
- Payment pain.
- Why OneLink helps.

End with a strong bottom banner:

`From wallet chaos to one professional payment page.`

---

# Optional Opening / Cover Slide

If the deck can have a cover before the 4 required slides, use this:

## Title

OneLink

## Subtitle

One USDC payment page for freelancers. Verified on Arc.

## Visual

Full-screen product mockup with profile + receipt + checkout cards.

## Footer

Live app · GitHub · Launch readiness

---

# Optional Closing Slide

If the deck can have a closing slide after the 4 required slides, use this:

## Title

The ask

## Message

We are building the payment link layer for freelancers in the stablecoin economy.

## CTA

Try the live app. Review the proof. Follow the build.

## Links

- Live app: https://onelink-mauve-nu.vercel.app
- GitHub: https://github.com/Pratiikpy/onelink
- Launch readiness: https://github.com/Pratiikpy/onelink/blob/main/docs/LAUNCH_READINESS.md

---

# Recommended Slide Copy — Short Version

Use this if the final deck needs less text.

## Slide 1

Freelancer payments break at the chain step.

Stablecoins are global, but clients and freelancers still get stuck on wallets, networks, addresses, and proof. Crypto payments should not feel like technical support.

## Slide 2

OneLink gives freelancers one payment page for USDC.

Share a profile or invoice link. Client pays through a supported route. OneLink verifies settlement on Arc and creates a receipt.

## Slide 3

Built with Arc, Circle, and proof-first QA.

Arc Testnet settlement, Circle CCTP/App Kit route, WalletConnect, Supabase reconciliation, Solidity contract, CI, CodeQL, and live transaction proof.

## Slide 4

For freelancers, creators, consultants, and small agencies.

Start with Web3-native freelancers accepting USDC today. Expand to global service providers who want stablecoin payments without chain confusion.

---

# Design Rules

## Do

- Use short, bold headlines.
- Use real product screenshots.
- Keep proof visible.
- Show exact scope honestly.
- Make each slide feel like a product launch page.
- Use OneLink's v2 warm-white + blue (`#1E50E5`) branding consistently.

## Do Not

- Do not use random crypto coin illustrations.
- Do not use purple SaaS gradients.
- Do not overfill slides with paragraphs.
- Do not claim unsupported chains.
- Do not hide that this is testnet.
- Do not make the deck look like a school assignment.

---

# Best Final Narrative

Freelancers should not need to become payment support agents just to get paid in USDC.

OneLink gives them one professional payment page. Clients can pay through supported USDC routes. Settlement is verified on Arc. Receipts are backed by onchain proof.

That is the product story.