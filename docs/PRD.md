# OneLink Collect — Product Requirements

> Product brief for design handoff. Use this to scope a high-fidelity Figma
> prototype. The design system, screen layouts, components, colors, and
> typography are **for the designer to define from scratch** — this doc only
> describes *what the product does* and *why*.

| | |
|---|---|
| **Status** | v1 — pre-launch |
| **Owner** | Pratik (@Pratiikpy) |
| **Network** | Arc Testnet (chain id 5042002) — USDC as native gas |
| **Last updated** | 2026-05-25 |

---

## 1 · Problem & opportunity

**The problem.** Independent designers, freelancers, and small teams who get
paid in USDC have no clean way to send a *single shareable link* the way
Stripe Payment Links works for cards. Today they end up DMing their wallet
address, hoping the payer is on the right chain, and chasing screenshots for
receipts.

**Why now.**

- USDC is the largest stablecoin and Arc (Circle's purpose-built chain) makes
  it the native gas token — sub-second settlement, no ETH-for-gas friction.
- Circle App Kit (GA Aug 2025) ships a single SDK that bridges USDC from
  any chain into Arc via CCTP and spends across chains via Unified Balance.
- Wallet UX in 2026 is dramatically better than 2022 — connecting with a
  phone + QR is now a 5-second flow on every major wallet.

**The opportunity.** *Stripe Payment Links, but for USDC on Arc.* A clean,
mobile-first, copy-and-paste payment link with on-chain settlement and a
verifiable Arcscan receipt.

**One-line positioning.** *One link. Any USDC. Instantly on Arc.*

---

## 2 · Audiences

| Audience | Use case | What they need |
|---|---|---|
| **Independent designer / dev** *(primary)* | "Pay me 250 USDC for the branding work" | Create a link in under 30 seconds, paste it in iMessage / Slack / Twitter, get a verifiable receipt. |
| **Crypto-native team / DAO** | Recurring contributor payouts | Bulk-link generation, CSV export, multi-recipient. *(v2)* |
| **Web3 founder collecting beta sub fees** | Small, ad-hoc charges | Public-facing link, zero wallet-setup friction for the payer. |
| **The payer** *(secondary but critical)* | "I owe Pratik USDC, here's a link" | Mobile-first flow that works on any chain they have funds on. |

### Anti-personas (not designing for)

- High-volume merchants (no API, no inventory, no SKUs in v1).
- Cards / ACH / fiat payers — USDC-only by design.
- Custodial users — we never touch keys on our side.

---

## 3 · Core promise — what shipping looks like

A successful v1 satisfies all four:

1. **Create a link in under 30 seconds** — amount + memo + (optional) expiry. Recipient defaults to the connected wallet.
2. **Pay in under 30 seconds** — open the link on a phone, connect a wallet, tap pay. If the payer's USDC lives on a non-Arc chain, CCTP bridges it in via a single tap.
3. **Receipt in under 5 seconds** — on-chain settlement, Arcscan transaction link, status flips to paid.
4. **Track everything** — a creator surface showing every link the user has created, with copy / share / cancel actions per link.

If any of those four breaks for a non-trivial percentage of users, v1 isn't ready.

---

## 4 · Primary user flows

The designer should treat each flow as a complete journey. The number of
intermediate screens and how they're composed is a design call.

### Flow A · Create a link

```
Creator lands on the product → connects a wallet → fills amount + memo + (optional) expiry
       → confirms the on-chain createLink transaction
       → arrives at a shareable URL for that specific link
       → copies or natively shares the URL
```

**Decisions the creator makes.**

- Amount in USDC (6-decimal precision, hard-capped at 1,000,000 per link).
- Recipient address (defaults to the connected wallet; can be overridden).
- Memo (free-text, what the link is for; required, non-empty).
- Expiry (optional; if set, must be in the future).

**Failure modes the design must handle.**

- Wallet not connected → primary action is blocked with a clear, friendly call to connect.
- Invalid input (negative amount, too-large amount, past expiry, malformed recipient) → inline validation, the form stays filled in.
- User rejects the wallet signature → return to the form with an explanatory message; nothing is lost.
- Network / RPC failure → user-recoverable error with retry.

### Flow B · Pay a link

```
Payer opens the shared link on a phone → connects a wallet
       → picks a settlement path:
           a) Pay directly on Arc Testnet (already holds USDC there)
           b) Bridge & pay — from Base / Ethereum / Arbitrum Sepolia via CCTP
           c) Pay from a unified balance held across multiple chains (Gateway)
       → approves spend → settles → sees a receipt with the on-chain tx
```

**Decisions the payer makes.**

- Which settlement path. The product proposes the cheapest / fastest path for the funds they actually have.
- Which wallet to connect. Standard wallet-connect UX; not part of our product surface.

**Failure modes the design must handle.**

- Link does not exist → friendly not-found state with a way back to the product.
- Link is already paid → show the receipt instead of the pay form; no double-payment possible.
- Link is expired → blocked, with the creator's identity exposed so the payer can reach out.
- Link was cancelled by the creator → blocked, with copy explaining the link is no longer accepting payment.
- Payer's wallet is on the wrong chain → prompt to switch with a single tap; the product handles the switch.
- Payer has insufficient USDC on the destination chain → show a clear deficit (e.g. "you need X more USDC") and offer a faucet link (testnet) or the bridge path.
- Bridge step fails / times out → step-level error surfaced; retryable.
- Transaction rejected in wallet → return to the pay screen with the link still actionable.

### Flow C · Track + manage links

```
Creator opens the dashboard → connects their wallet
       → sees a list of every link they have created, with status
       → per link can: copy the URL, open the pay page, cancel (if unpaid),
         or open the receipt
       → KPI roll-up across all links
```

**Decisions the creator makes.**

- Whether to cancel a still-open link (irreversible, on-chain).
- Whether to share a still-open link to a different audience.

**Failure modes the design must handle.**

- Wallet not connected → there is nothing to show; design a clear connect prompt instead of empty zeros.
- Wallet connected but no links yet → a clear first-link onboarding state, not silent zeros.
- Cancel attempted on a link that has just been paid in a different tab → graceful error, refresh the list.
- Network/RPC failure during cancel → user-recoverable error with retry.

---

## 5 · Functional states the design must cover

Per logical entity. *How* these are represented visually is the designer's
call, but every state listed here must be representable somewhere in the UI.

### 5.1 · A payment link

A link is always in exactly one state. The design should make it obvious which one.

| State | Meaning | What the design conveys |
|---|---|---|
| `unpaid` | Created, nobody has paid yet | Actionable — share + pay flows are available |
| `processing` | A pay attempt is in flight | In-progress, not yet final |
| `paid` | Settlement complete on Arc | Sealed, success, receipt is the destination |
| `expired` | Past its expiry, nobody can pay it now | Read-only, with a clear reason |
| `cancelled` | The creator voided it before it was paid | Read-only, with a clear reason |
| `failed` | A pay attempt failed and was not retried | Recoverable — payer can try again |

### 5.2 · The product itself

| Mode | Meaning |
|---|---|
| **Live mode** | The on-chain contract is configured. All flows move real USDC. |
| **Preview mode** | The contract is not configured (e.g. before deploy, or for hackathon previews). All flows are simulated end-to-end; receipts are clearly marked as not on-chain. The design must make this distinction unmistakable so a visitor never confuses a simulated receipt with a real one. |

### 5.3 · Wallet connection

| State | Meaning |
|---|---|
| `not connected` | No wallet attached. Creation and payment are gated. |
| `connected, correct chain` | Wallet on Arc Testnet — primary actions are immediately actionable. |
| `connected, wrong chain` | Wallet on a different chain — the product offers a one-tap switch. |

---

## 6 · Feature list (prioritized)

Each row is a complete vertical slice — design + engineering + copy.

| # | Feature | Priority | Notes |
|---|---|---|---|
| 1 | Create USDC payment link | **P0** | Amount, recipient (default self), memo, optional expiry. On-chain `createLink` + off-chain metadata. |
| 2 | Pay a link directly on Arc | **P0** | Approve + settle. |
| 3 | Bridge & pay from Base / Ethereum / Arbitrum Sepolia | **P0** | One action per source chain via Circle App Kit + CCTP. |
| 4 | Pay with Circle Unified Balance | **P0** | Single call across chains via Circle Gateway. |
| 5 | Receipt with Arcscan transaction | **P0** | Sealed, shareable URL with verifiable on-chain proof. |
| 6 | QR for cross-device handoff | **P0** | Designer's call where it lives; product needs the payer-on-mobile flow to work. |
| 7 | Native share sheet (mobile) | **P0** | Web Share API with clipboard fallback. |
| 8 | Creator dashboard | **P0** | List, KPIs, copy / open / cancel / receipt per link. |
| 9 | Cancel link (creator-only, unpaid-only) | **P0** | On-chain `cancelLink`. Irreversible. Confirm before signing. |
| 10 | Preview mode for unconfigured deploys | **P0** | Visually unmistakable preview-mode signaling everywhere a "payment" surface appears. |
| 11 | Environment health on a settings surface | **P1** | "Ready" vs "action needed" at-a-glance — for the operator, not the end user. |
| 12 | Pre-flight USDC balance check | **P1** | "You need X more USDC on Arc" with a one-tap faucet link (testnet). |
| 13 | Pre-flight chain hint + auto-switch | **P1** | Detect wrong chain, switch automatically when the payer taps pay. |
| 14 | Bulk link generation + CSV import | **V2** | DAO / team payouts. |
| 15 | Webhooks for paid links | **V2** | "Notify Slack when this link is paid." |
| 16 | Multiple recipients / split payment | **V2** | One link → contract splits across N recipients. |
| 17 | Mainnet support | **V2** | When Arc Mainnet launches. |

P0 = in v1. P1 = polish before public launch. V2 = explicitly out of scope.

---

## 7 · Brand direction (for the designer to interpret)

These are constraints, not solutions.

- **Tone.** Confident, modest, fast. We're a financial tool, not a meme coin. We don't shout.
- **Visual feel.** Clean. Modern. Apple-like. Restraint over decoration. The mood is closer to Linear / Stripe / Vercel than to typical Web3 dashboards.
- **Mobile-first.** A creator on a laptop and a payer on a phone are the two primary surfaces. The phone experience is at least as important as the desktop one.
- **Dark or light?** Open to the designer.
- **Color count.** Prefer few colors used deliberately over many. We're a payments product; trust signals matter more than vibe.
- **Type.** Open. Pick a typeface that supports the "confident and modest" tone and has a strong variable-font implementation.
- **Density.** Prefer breathing room. The product carries small amounts of dense data (addresses, hashes, amounts) on otherwise spacious screens. Don't trade legibility for compactness.

---

## 8 · Non-goals (explicit for v1)

- No fiat on/off-ramp.
- No mainnet support (testnet only until Arc Mainnet launches).
- No notifications (no email, no SMS, no Slack).
- No teams / multi-creator (single wallet creator surface only).
- No invoicing (no line items, no PDF export — receipt is the deliverable).
- No analytics dashboard for the creator beyond a small KPI roll-up.

If a stakeholder asks for one of these, the answer is *v2*.

---

## 9 · Success metrics

If we hit these in the first 90 days post-launch, v1 is a success.

| Metric | Target |
|---|---|
| **Time to first link created** (landing → shareable URL) | under 60 seconds |
| **Pay completion rate** (links opened → paid) | ≥ 40% |
| **Mobile share rate** (Share action taps / pay screen visits) | ≥ 25% |
| **Bridge usage** (CCTP / Unified Balance pays / total pays) | ≥ 30% — proves the multi-chain value prop |
| **Lighthouse mobile** | ≥ 90 across Performance, Accessibility, Best Practices, SEO |

---

## 10 · Open product questions

These are *product* unknowns — not visual ones. The designer should push back
on any of these where their experience suggests an answer.

1. **Memo as required?** It's required in v1 because empty memos make for ugly receipts and confused payers. Should the field instead suggest a default ("Payment for {creator}") and stay optional?
2. **Expiry default.** Today expiry is opt-in and defaults to never. For pay-me-once-by-Friday use cases, should links default to a 7-day expiry the user can extend?
3. **Cancel cool-down.** Cancel is on-chain and instant — no undo. Should we add a 30-second client-side cool-down before the chain tx fires so accidental clicks are recoverable?
4. **Settlement-path discovery.** The payer has 3+ ways to settle (direct on Arc, bridge per source chain, unified balance). Is auto-detecting the cheapest / fastest path and proposing it as the default the right move, or is exposing every path upfront the more honest trade?
5. **Receipts as artifacts.** Today receipts are a webpage. Should there be a downloadable / shareable image version, a Notion-embeddable block, or a printable PDF?
6. **Notifications.** v1 has none. Is "the page" enough as the source of truth, or should the creator get an email / Slack ping when a link is paid? (This is V2 in §6 but worth confirming.)
7. **Multiple links open at once.** A creator might paste the same link to two different clients. Today the link is single-use (first paid wins). Should we expose a "single use vs. open invoice" toggle at creation time?
8. **Wallet picker.** Worth a branded wallet picker, or stay with a standard wallet-connect UX for the network effects? (Probably standard for v1.)

---

## 11 · Deliverables we need from design

To go from this brief to a prototype:

1. **High-fidelity Figma frames** for every flow in §4, covering every state in §5, at both desktop and mobile breakpoints.
2. **A short Loom (or recorded screen-share)** walking through Flow A → Flow B → Flow C, narrating the design decisions and the rationale where they diverge from the obvious path.
3. **A design-system page** in Figma containing the chosen typography scale, named color tokens, spacing scale, radius scale, motion specs, and the set of UI primitives the prototype is composed from. Engineering will translate these into code tokens.
4. **Empty / loading / error states** — these tend to get skipped. Treat them as first-class.
5. **A 1-page "rationale" doc** answering each open product question in §10. If the answer is "I picked option B because X," that's enough.
6. **Optional but welcome:** a brand exploration moodboard before the high-fi pass — 2-3 visual directions to align on tone before committing.

---

## 12 · External references (for context, not for visual lifts)

These are linked for the *product mental model*, not as visual targets.

- **Stripe Payment Links** — the closest non-crypto analogue. https://stripe.com/payments/payment-links
- **Circle App Kit docs** — the SDK that powers the bridge + unified-balance flows. https://docs.circle.com
- **Arc Testnet docs** — the chain we settle on. https://docs.arc.io

---

*Questions / objections / "this is wrong because" → file an issue on the
repo or DM me. Iterate this doc as we learn.*
