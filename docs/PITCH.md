# OneLink — Pitch

> **One link. Supported USDC routes. Verified on Arc.**

OneLink Collect turns an invoice into a single shareable URL. The payer pays
however they already hold USDC — directly on Arc, or bridged in from another
testnet via Circle CCTP — and both sides finish with a **receipt that is
verified on-chain**, not a screenshot or a "trust me" link.

- **Live app:** https://onelink-mauve-nu.vercel.app
- **In-app pitch:** https://onelink-mauve-nu.vercel.app/pitch
- **Whitepaper:** https://onelink-mauve-nu.vercel.app/whitepaper
- **How it works:** https://onelink-mauve-nu.vercel.app/how-it-works
- **Repo:** https://github.com/Pratiikpy/onelink

---

## 1. Elevator pitch

**Short:** Freelancers lose hours to "which wallet, which chain, which address,
which USDC?" OneLink replaces that with one professional payment page. The
client pays through a supported USDC route, it settles on Arc Testnet, and the
server only marks it **paid** after verifying the on-chain event — so every
receipt links a real transaction you can re-check on Arcscan.

**One line (for forms):** *One payment link for supported USDC routes, settled
and verified on Arc Testnet.*

---

## 2. The problem

Getting paid in stablecoins is still a coordination tax, especially across
borders:

- Payment requests devolve into a back-and-forth about **wallets, networks,
  address formats, and USDC variants**.
- Clients want reassurance and proof; freelancers end up doing ad-hoc support
  and sending screenshots.
- A screenshot or a raw block-explorer link is **not a professional checkout
  experience**, and it doesn't prove the money actually arrived.

This is a global freelancer problem — across borders, currencies, and client
expectations — and it gets worse the moment two people are on different chains.

---

## 3. The solution

OneLink collapses chain confusion into **one link that ends in proof**.

```
Freelancer creates a link  →  Client opens it  →  Client connects a wallet
   →  Pays through a supported USDC route  →  OneLink verifies settlement on Arc
   →  A verifiable receipt is generated for both sides
```

The defining design principle is **"settlement before status"**: the UI only
shows *paid* after the server has verified the matching Arc Testnet event
on-chain. The browser can ask; the chain decides.

---

## 4. What makes it different

This is not "another payment-link app." The distinctive bets are:

1. **The payer pays however they already hold USDC.** Direct on Arc, or bridged
   from Base Sepolia through **Circle CCTP** — and it always *lands on Arc*. The
   creator shares one link; the payer's chain situation is their problem, not
   the creator's.
2. **USDC is the only token the payer needs.** Arc's **native gas token is
   USDC**, so there is no "buy ETH to pay gas" dance. The same balance pays the
   invoice and the network fee.
3. **Server-verified state, not browser trust.** A final `paid`/`cancelled`
   state is written only after an API verifies the matching on-chain event. The
   contract — not the front-end — is the source of truth.
4. **Every claim has a hash.** Each proven flow links a real Arcscan
   transaction. In a field full of mocked demos, OneLink can say *"re-check it
   yourself."*
5. **Premium product, standard stack.** An editorial, Apple-minimal UI built on
   a conventional, credible Web3 stack — it looks and feels shippable.

---

## 5. How it works (the journey)

1. **Create** — On `/create` the creator sets amount, memo, recipient, and an
   optional expiry, then signs one Arc transaction. The server verifies the
   `PaymentLinkCreated` event before the invoice is ever persisted.
2. **Share** — The link (or its QR) goes to the payer. No account, no signup —
   they connect a wallet only when they're ready to pay.
3. **Pay** — The payer settles directly on Arc, or bridges USDC in from Base
   Sepolia via Circle CCTP. USDC pays the gas; no ETH required.
4. **Verify** — The server watches Arc for the matching `PaymentCompleted`
   event and only then writes the final `paid` state.
5. **Receipt** — `/receipt/[id]` shows the verified Arcscan transaction, the
   settlement contract, and a server-verified flag — every detail a reviewer
   needs to inspect.

---

## 6. Product surfaces

| Surface | Route | What it does |
| --- | --- | --- |
| Landing | `/` | Premium marketing page: the pitch, routes, pricing, live receipt proof |
| Create link | `/create` | Wallet-connected link creation, on-chain registration, QR + share |
| Pay | `/pay/[slug]` | Checkout: route selector (Arc / Bridge / Gateway), pre-flight checks, settlement |
| Receipt | `/receipt/[id]` | Verified, shareable receipt anchored to the Arcscan tx + proof drawer |
| Profile | `/[handle]` | Permanent "Linktree-style" freelancer handle that accepts payments |
| Dashboard | `/dashboard` | Per-wallet view of links + statuses (private to the wallet) |
| Settings | `/settings` | Profile + environment-health panel |
| How it works | `/how-it-works` | Judge-facing explainer: flow, trust model, Arc+Circle, proof links |
| Whitepaper | `/whitepaper` | Technical thesis + architecture + verified scope |
| Pitch | `/pitch` | In-app pitch deck |
| Trust pages | `/security`, `/privacy`, `/terms` | Honest scope, data handling, terms |
| Brand | `/brand` | Design-system reference |

---

## 7. Supported payment routes

| Route | Status | How it works |
| --- | --- | --- |
| **Arc-direct** | ✅ Live-proven | Payer holds USDC on Arc. Two txs: approve + `payLink`. Settles directly on Arc. |
| **Bridge via Circle CCTP** | ✅ Live-proven (Base Sepolia → Arc) | Approve + burn on the source chain, Circle attestation, mint on Arc, then settle — one flow via Circle App Kit. |
| **Unified balance via Circle Gateway** | 🔒 Implemented but **gated** | EIP-712 burn-intents against a Gateway deposit. Disabled in checkout until a funded end-to-end proof is run. |

Additional CCTP source chains (Ethereum Sepolia, Arbitrum Sepolia, Polygon
Amoy) are wired but remain **beta** until each receives the same live-proof
standard as Base Sepolia.

---

## 8. Live proof (this is the differentiator)

OneLink is a **working, deployed** product — not a mockup. Every flow below was
proven on the live public deployment with a real on-chain transaction:

| Flow | Settlement transaction (Arcscan) |
| --- | --- |
| Direct Arc payment | `0x508ebf9ac99613534e82d768d423c0d30c274c57d30f0181c9cba6805e5ddd46` |
| Verified creator cancellation | `0x9a7d08580a5313cb97220c21e2011d6f042cc0c6db0349d75a4cafc46bdc5138` |
| Permanent profile payment | `0xe6521e60bd25a01a82124ec22a368c9200480081b2708ffadcce23779aed0fea` |
| WalletConnect signed payment | `0x2f5abeb1840cd6ed905cb3af6d72e7de7c6ad44c84a30050a79605eceea48daa` |
| Browser-wallet end-to-end | `0x031e671e9321e60310276af91a1bb3b52c8079be86a824bc0378edd98a67a889` |
| Base Sepolia → Arc bridge settlement | `0xc5ac72e58a77fd48c9f6781031557fbd63cc6c7556876f25b1bb218aea240ee3` |

Open any of them at `https://testnet.arcscan.app/tx/<hash>`. A live example
receipt: https://onelink-mauve-nu.vercel.app/receipt/7e41bf18-b61c-4af2-baeb-b10f219d58e8

**Engineering proof:**

- ✅ **27/27 Foundry contract tests** passing (`OneLinkCollect.sol`).
- ✅ `lint` · `typecheck` · production `build` all green; enforced on a
  protected `main` via GitHub CI.
- ✅ **Zero** open CodeQL, Dependabot, and secret-scanning alerts.
- ✅ Responsive QA across **5 viewports** (390 / 768 / 1366 / 1440 / 1920) ×
  every route, captured to `docs/test-results/`.
- ✅ Server-side security boundaries proven: forged anonymous invoice creation
  and forged cancellation are **rejected**; only verified Arc events flip state.

---

## 9. Verified scope (honest by design)

| Area | Status |
| --- | --- |
| Live Vercel app | ✅ Verified |
| Arc Testnet direct payment | ✅ Live-proven |
| WalletConnect signed payment | ✅ Live-proven |
| Base Sepolia → Arc bridge (CCTP) | ✅ Live-proven |
| Verified receipts | ✅ Live-proven |
| Permanent profile payment | ✅ Live-proven |
| Creator cancellation | ✅ Live-proven |
| Failure / recovery states | ✅ Tested |
| Responsive UI | ✅ Tested |
| GitHub CI + CodeQL | ✅ Green |
| Open security alerts | ✅ Zero |
| Circle Gateway checkout | 🔒 Gated until a funded end-to-end flow is proven |
| Solana | ❌ Not implemented |
| Mainnet | ❌ Not claimed (testnet only) |

> We do not claim mainnet readiness, "any blockchain," automatic payment from
> arbitrary wallet funds, or a proven Circle Gateway checkout. The product
> language is limited to what is proven live.

---

## 10. Arc + Circle integration

| Layer | Choice | Why it matters |
| --- | --- | --- |
| Settlement | **Arc Testnet** (chain `5042002`) | USDC is the native gas token; deterministic on-chain finality; no ETH-for-gas friction. |
| Bridge | **Circle CCTP + App Kit** | Native USDC burn-and-mint from supported testnets into Arc, with retry-safe step events. |
| Unified balance | **Circle Gateway** | Spend a deposited USDC balance cross-chain (gated until funded proof). |
| Settlement contract | **`OneLinkCollect`** on Arc | One source of truth; a hard-capped ≤1% protocol fee enforced in the contract. |
| Receipts | **Arcscan + server reconciliation** | Every paid receipt links the exact on-chain settlement. |

---

## 11. Pricing & model

- **One transparent fee, capped on-chain.** The protocol fee is hard-capped at
  **1%** inside `OneLinkCollect.sol` — the contract reverts if anyone tries to
  set it higher. No subscription, no platform fees on testnet.
- Non-custodial: USDC moves directly from payer to recipient via the contract;
  OneLink never holds keys.

---

## 12. Who it's for

- **Primary wedge:** global freelancers and independent service providers who
  invoice clients in USDC and lose time/credibility at the chain step.
- **Expansion:** creators, indie sellers, and Web3-native teams that need a
  professional, verifiable "request → pay → receipt" loop.

---

## 13. How we used Codex (meaningful, not mentioned)

Codex was the **main build-and-verification agent** for OneLink — not a code
suggester. Every claim here maps to a verifiable artifact:

- **Goal-driven loops** — work was organized around explicit launch goals in
  build → test → fix → verify cycles, each tied to a measurable outcome.
- **MCP research before coding** — Arc, Circle, and Supabase were inspected
  through live MCP servers before changes, so the implementation matched real
  docs and live behavior, not stale assumptions.
- **Arc & Circle skills for correct primitives** — the Arc, USDC, CCTP,
  Gateway, wallet, and Supabase skills kept payment/settlement logic on the
  right patterns and prevented overclaiming unsupported routes.
- **Real product wiring** — link creation, wallet connect, direct Arc
  settlement, Base→Arc bridging, profile payments, cancellations, and verified
  receipts, all around real settlement paths.
- **Evidence-first QA** — Playwright + Rabby-based flows tested it like a user
  across wallets, routes, breakpoints, and failure states, capturing
  screenshots and transaction hashes as proof.
- **Honesty enforced** — testnet scope held; Gateway/Solana/mainnet stayed
  gated; demo mode made explicit; README, pitch, whitepaper, and launch docs
  reconciled to one story.
- **`AGENTS.md` discipline** — a committed `AGENTS.md` kept agent execution
  consistent, reviewable, and product-focused across sessions.

The difference between "built with AI" and "built with AI **plus verification
discipline**."

---

## 14. Why now

- Arc Testnet makes a **USDC-native** payment experience possible (USDC is gas).
- Circle CCTP is mature enough to move native USDC across chains reliably.
- Stablecoin freelancing is growing globally, and the chain-step friction is
  unsolved at the "professional checkout" layer.

---

## 15. Roadmap / what's next

- **Gateway public enablement** — un-gate the Circle Gateway unified-balance
  route once a funded deposit → burn → mint flow is proven end-to-end.
- **More bridge sources** — promote Ethereum Sepolia, Arbitrum Sepolia, and
  Polygon Amoy from beta to proven.
- **Mainnet pilot** — closed-cohort rollout after funded Gateway proof + a final
  security review.
- **Solana** — evaluate as a future settlement/source option (not implemented).

---

## 16. The vision

OneLink is a **working, polished, testnet-ready product** today — live
deployment, verified payment flows, real Arc + Circle integration within a
disciplined scope, premium UX, launch-readiness proof, and a clean security
posture. The path is simple: *testnet today, mainnet next.*

---

## 17. Demo script for judges (≈2.5 min)

1. **Hook (15s)** — the one-line problem + "watch money land and prove it
   on-chain."
2. **Create (30s)** — make a link on `/create` (or open a pre-made one); show
   the link/QR.
3. **Pay (45s)** — pay it with a pre-funded wallet on Arc; watch the settlement
   timeline reach *paid*.
4. **Prove it (30s)** — open the receipt → click through to **Arcscan** →
   *"this is a real transaction; verify it yourself."*
5. **Breadth (20s)** — show the Bridge (Base → Arc via CCTP) route exists.
6. **Scope + Codex (20s)** — honest scope (testnet, Gateway gated) + a line on
   meaningful Codex usage.

**Fallback:** keep a pre-paid receipt + its Arcscan tx open in a tab so a slow
live payment never breaks the moment.

---

## 18. Links

- Live app · `/pitch` · `/whitepaper` · `/how-it-works`
- GitHub: https://github.com/Pratiikpy/onelink
- Launch readiness (full proof + tx hashes): `docs/LAUNCH_READINESS.md`
- Security review: `docs/SECURITY_REVIEW.md`
- Technical whitepaper: `docs/WHITEPAPER.md`
