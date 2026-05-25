# OneLink Collect — Product Requirements

> Working doc for design + product. Use this to scope a high-fidelity Figma
> prototype. Engineering reference is the live build at
> [onelink-mauve-nu.vercel.app](https://onelink-mauve-nu.vercel.app) and the
> source in this repo.

| | |
|---|---|
| **Status** | v1 — design polish before public launch |
| **Owner** | Pratik (@Pratiikpy) |
| **Stack** | Next.js 15 · Tailwind · wagmi + viem · Circle App Kit · Foundry · Supabase |
| **Network** | Arc Testnet (chain id 5042002) — USDC as native gas |
| **Last updated** | 2026-05-25 |

---

## 1 · Problem & opportunity

**The problem.** Independent designers, freelancers, and small teams who get
paid in USDC have no clean way to send a *single shareable link* the way Stripe
Payment Links works for cards. Today they end up DMing their wallet address,
hoping the payer is on the right chain, and chasing screenshots for receipts.

**Why now.**
- USDC is the largest stablecoin and Arc (Circle's purpose-built chain) makes
  it the native gas token — sub-second settlement, no ETH-for-gas friction.
- Circle App Kit (GA Aug 2025) ships a single SDK that can bridge USDC from
  any chain into Arc via CCTP and spend across chains via Unified Balance.
- Wallet UX in 2026 is dramatically better than 2022 — connecting with a phone
  + QR is now a 5-second flow on every major wallet.

**The opportunity.** The "Stripe Payment Link, but for USDC on Arc." A clean,
mobile-first, copy-and-paste payment link with on-chain settlement and a
verifiable Arcscan receipt.

**One-line positioning.** *One link. Any USDC. Instantly on Arc.*

---

## 2 · Audiences

| Audience | Use case | What they need |
|---|---|---|
| **Independent designer / dev** *(primary)* | "Pay me $250 for the branding work" | Create a link in <30s, paste it in iMessage / Slack / Twitter, get a receipt. |
| **Crypto-native team / DAO** | Recurring contributor payouts | Bulk-link generation, CSV export, multi-recipient. *(v2)* |
| **Web3 founder collecting beta sub fees** | Small, ad-hoc charges | Public-facing link, no wallet setup friction for payer. |
| **The payer** *(secondary but critical)* | "I owe Pratik USDC, here's a link" | Mobile-first flow that works on any chain they have funds on. |

### Anti-personas (not designing for)

- High-volume merchants (no API, no inventory, no SKUs in v1).
- Cards/ACH/fiat payers (this is USDC-only by design).
- Custodial users (no key management on our side).

---

## 3 · Core promise — what shipping looks like

1. **Create a link in <30 seconds** — amount + memo + (optional) expiry. Recipient is the wallet I'm connected with by default.
2. **Pay in <30 seconds** — open link on mobile, connect wallet, tap pay. If my USDC is on Base/Ethereum/Arbitrum Sepolia, CCTP bridges it in under one tap.
3. **Receipt in <5 seconds** — on-chain settlement, Arcscan link, status = `paid`.
4. **Track everything** — a creator dashboard with all my links, copy/share/cancel actions.

If any of these breaks, we don't ship.

---

## 4 · Primary user flows

### Flow A · Create a link

```
Connect wallet → Fill amount + memo + optional expiry → Sign createLink tx
              → Land on /pay/[slug] (the link)
              → Tap Copy or Share → Send via iMessage/Slack/Twitter
```

| Step | What we show | Edge cases |
|---|---|---|
| Connect | Generic wallet sheet (RainbowKit) | Wallet not installed → install prompt |
| Form | Amount (USDC, 6 decimals), Recipient (defaults to connected wallet), Memo, Expiration (optional) | Amount > 1M USDC blocked, expiry-in-past blocked, recipient must be checksum-valid |
| Sign | Wallet sheet for `createLink` | User rejects → inline error, form stays filled |
| Result | `/pay/[slug]` with QR + status `unpaid` | Demo mode (no contract): no tx, just localStorage write |

### Flow B · Pay a link

```
Open /pay/[slug] from a shared link → Connect wallet → Choose path:
  ├─ Pay on Arc        (if already have USDC on Arc)
  ├─ Bridge & pay      (from Base/Ethereum/Arbitrum Sepolia)
  └─ Unified Balance   (Circle Gateway — spends across chains)
→ Approve → Settle → Receipt
```

| Step | What we show | Edge cases |
|---|---|---|
| Land | Amount, memo, receiver shortAddress, QR code, network = Arc Testnet | Link not found → /not-found  ·  Link expired → red banner, buttons disabled  ·  Link cancelled → red banner, buttons disabled  ·  Link already paid → green banner + "View receipt" |
| Pay flow | A 4-step row: `Approve · Move USDC · Settle on Arc · Receipt` showing active/done/failed | Insufficient USDC → "need 12.34 more USDC on Arc" hint + faucet link  ·  Wrong chain → amber hint, switchChain on tap |
| Done | `status = paid`, tx hash, Arcscan link | Demo mode tx hash is `0xDEM0…` — receipt shows amber "no on-chain transaction" badge |

### Flow C · Track + manage links

```
Dashboard → See all links by status → Per link:
  ├─ Copy link URL
  ├─ Open the pay page
  ├─ Cancel (if unpaid)
  └─ View receipt
```

| Step | What we show | Edge cases |
|---|---|---|
| Empty (no wallet) | Card prompting Connect | n/a |
| Empty (no links) | Card prompting "Create your first link" | n/a |
| List | Each link: amount, memo, status pill, receiver short address + 4 action buttons | If link is paid/cancelled → cancel disabled |
| Cancel | Confirm modal (custom, not `window.confirm`) explaining it's irreversible | If on wrong chain: switch first, then sign |

---

## 5 · Screens & states (designer's checklist)

### 5.1 · App chrome (every page)

- **Top bar**: logo + DEMO pill (when no contract) · Faucet button · Connect Wallet
- **Left rail (≥lg)**: Create · Dashboard · Settings (active item highlighted)
- **Bottom dock (<lg)**: same 3 tabs, sticky bottom, icon + label
- **Demo banner** (when `!HAS_CONTRACT`): full-width amber strip — "Preview mode · settlements are simulated…"
- **Footer**: brand · nav · year · MIT note · chain id reference

### 5.2 · Create link (`/`)

| State | What's on screen |
|---|---|
| Wallet not connected | Hero + form is rendered but disabled · CTA reads "Connect wallet to create" |
| Wallet connected | Form active · CTA reads "Create payment link" |
| Submitting | CTA shows spinner + label stays |
| Validation error | Inline red banner above CTA (specific message — see Flow A) |
| Created | Route to `/pay/[slug]` |

**Sidebar (right column ≥lg).** *Why payers love it* card with 4 benefit rows + *Testnet tip* card.

### 5.3 · Pay link (`/pay/[slug]`)

| State | Notes |
|---|---|
| Loading | Centered card with spinner |
| Not found | Centered card · "Link not found" · CTA "Create a link" |
| Unpaid (default) | Left col: amount + QR + memo + actions (Copy / Share / Receipt). Right col: balance + 3 settlement CTAs + 4-step flow card |
| Wallet not connected | All CTAs disabled · primary reads "Connect wallet to pay" |
| Insufficient USDC on Arc | Pay button disabled · "Need 12.34 more USDC on Arc" · amber hint with faucet link |
| Wrong chain | Amber hint: "Your wallet is on a different chain. Pay-on-Arc will prompt a chain switch before sending." |
| Expired | All pay buttons disabled · red banner: "This link is expired." |
| Cancelled | All pay buttons disabled · red banner: "The creator cancelled this payment link. Reach out to them for a new one." |
| Paid (and not demo) | Primary CTA: "Already paid" · "View on Arcscan" link · QR replaced with a "Settled" card |
| Paid in demo mode | Same as paid but with amber "Demo settlement · no on-chain transaction" note. Arcscan link hidden. |
| Submitting | 4-step flow card cycles through `idle → active → done` per step. Per-step icon swap. |
| Failed step | Step icon turns red · error banner under buttons |

**4-step flow card states (designed once, reused).**
- `idle` (default ash)
- `active` (violet spinner)
- `done` (mint check)
- `failed` (red X)

### 5.4 · Receipt (`/receipt/[id]`)

| State | Notes |
|---|---|
| Loading | Centered spinner card |
| No receipt | Card with empty state · CTA "Create a link" |
| Paid (real settlement) | Violet header band with big amount + check icon · 6 metadata rows · Copy + Arcscan buttons |
| Paid (demo) | Same but with amber "demo settlement" badge above the buttons · Arcscan button disabled |
| Expired / Cancelled / Failed | Same shell but the status pill carries the tone color · Arcscan disabled if no tx |

### 5.5 · Dashboard (`/dashboard`)

| State | Notes |
|---|---|
| Not connected | Single centered card · wallet icon · Connect button · secondary "Or create a link first" |
| Empty (connected) | Centered card · "No links yet" · CTA "Create link" |
| Refreshing | Refresh button spinner |
| Populated | 3 KPI cards (Total collected / Links / Paid) + list of link cards |
| Cancel confirm | Custom modal · title "Cancel this payment link?" · body explains irreversibility · primary danger button "Cancel link" · secondary "Keep it open" |
| Cancelling | Per-row spinner replaces the X icon · modal shows "Working…" |

**Each link row.** Amount + status pill + memo + receiver shortAddress · 4-button column (Copy / Open / Cancel / Receipt).

### 5.6 · Settings (`/settings`)

| State | Notes |
|---|---|
| Always | Page header + 4 cards: Environment health · Wallet · Network reference · Faucet/Arcscan launchers |
| Env health all-green | Top-right pill reads "Ready" (mint) |
| Env health missing | Top-right pill reads "Action needed" (amber). Each row has a check or X plus a friendly action hint |

### 5.7 · System pages

- **`/not-found` (any unknown URL)** — branded 404 card with compass icon
- **`/error` (runtime crash)** — branded crash card with "Try again" + "Home" + optional digest ID
- **Confirm dialog (modal)** — accessible `<dialog>` with title, body, danger or primary action

---

## 6 · Feature list (prioritized)

Each row is a complete vertical slice — engineering + design + copy.

| # | Feature | Priority | Notes |
|---|---|---|---|
| 1 | Create USDC payment link | **P0** | Amount, recipient (default self), memo, optional expiry; on-chain `createLink` + offchain metadata |
| 2 | Pay a link directly on Arc | **P0** | `approve` + `payLink`; 4-step UI |
| 3 | Bridge & pay from Base / Ethereum / Arbitrum Sepolia | **P0** | One button per source chain via Circle App Kit + CCTP |
| 4 | Pay with Circle Unified Balance | **P0** | Single call across chains via Gateway |
| 5 | Receipt with Arcscan tx | **P0** | Sealed, shareable URL; copy + Arcscan launcher |
| 6 | QR code on pay screen | **P0** | Native QR for cross-device handoff |
| 7 | Native share sheet (mobile) | **P0** | Web Share API with clipboard fallback |
| 8 | Creator dashboard | **P0** | List, KPIs, copy / open / cancel / receipt |
| 9 | Cancel link (creator-only, unpaid-only) | **P0** | On-chain `cancelLink` + sealed state |
| 10 | Demo mode for previewing without a contract | **P0** | Visually unmistakable banner + `0xDEM0…` tx hashes; production-safety throw if `NEXT_PUBLIC_ALLOW_DEMO` not opted-in |
| 11 | Environment health panel on Settings | **P1** | "Action needed" pill turns to "Ready" when contract / Supabase / WalletConnect / app URL all set |
| 12 | Pre-flight USDC balance check | **P1** | "Need X more USDC on Arc" hint + faucet link |
| 13 | Pre-flight chain hint | **P1** | Amber message + auto-switch on Pay tap |
| 14 | Locale-independent timestamps | **P2** | `Intl.DateTimeFormat("en-US")` pinned format |
| 15 | OG image + Apple touch icon + PWA manifest | **P2** | Dynamic via Next.js `app/*` routes |
| 16 | SEO basics (sitemap, robots, noindex on private routes) | **P2** | private = pay / receipt / dashboard |
| 17 | Bulk link generation + CSV import | **V2** | For DAO / team payouts |
| 18 | Webhooks for paid links | **V2** | "Notify Slack when this link is paid" |
| 19 | Multiple recipients (split payment) | **V2** | Sender pays once, contract splits |
| 20 | Native mainnet support | **V2** | When Arc Mainnet launches; promote out of Testnet |

P0 = in v1 today. P1/P2 = polish before public launch. V2 = explicitly out of scope for the first version.

---

## 7 · Brand foundation

The current build *is* the visual system. Designer should treat this as the
starting point and refine, not redesign from scratch.

### 7.1 · Color tokens (`tailwind.config.ts`)

| Token | Hex | Use |
|---|---|---|
| `ink` | `#08090C` | App background |
| `panel` | `#13141B` | Surface fills (rarely needed — most cards use `.glass`) |
| `panel2` | `#1B1D27` | Elevated surface |
| `line` | `rgba(255,255,255,0.08)` | Hairline borders |
| `violet` | `#7C5CFF` | Primary accent — buttons, focus rings, highlights |
| `violet-soft` | `#A89BFF` | Hover / lighter accent |
| `cyan` | `#5AE3FF` | Reserved for highlight glows (sparingly) |
| `mint` | `#34D399` | Success — paid status, env-health checks |
| `amber` | `#FBBF24` | Warning — demo banner, expired/insufficient hints |
| `ash` | `#9CA1B0` | Tertiary text |

**Text opacity ladder** on white `#F5F4FF`:
`100% → 85% → 65% → 45% → 38% → 25%`. Use these consistently for hierarchy.

### 7.2 · Type

- **Family:** `Geist Sans` (loaded via `geist` npm package, variable font).
- **Display headings** (≥4xl): `font-black` (900), `tracking-tighter2` (−0.025em).
- **Section headings**: `font-bold` (700), `tracking-tight` or default.
- **Eyebrow labels**: `font-black uppercase tracking-[0.16em]`, all-caps, used sparingly.
- **Body**: `font-medium` (500) at 14–16px, leading-6 to leading-7.
- **Mono**: not used in v1 (no inline code in product surfaces).

### 7.3 · Radius, spacing, motion

| Token | Value | Use |
|---|---|---|
| Card radius | `rounded-[28px]` | Hero cards |
| Sub-card radius | `rounded-2xl` (16px) | Buttons, inputs, inner tiles |
| Pill radius | `rounded-full` | Status pills, eyebrow tags |
| Icon container | `size-12` or `size-14`, `rounded-2xl`, 30% accent border + 10% fill | Pay/receipt/error icons |
| Shadow | `shadow-glow` (subtle violet) — only on primary CTA | |
| Motion | 200ms ease for hover, 150ms for state changes | No big motion choreography in v1 |

### 7.4 · Background

Single subtle radial-gradient violet glow at the top, then uniform dark.
Not two layered gradients, not a glass-y mesh. Restraint.

```css
background:
  radial-gradient(900px circle at 50% -10%, rgba(124,92,255,0.10), transparent 60%),
  #08090c;
```

### 7.5 · Components in `components/ui.tsx`

- `<Card>` — `.glass` + 28px radius + padding
- `<Field>` — label + child + optional hint
- `<Input>` / `<Textarea>` — 56px tall, 16px radius, focus ring violet
- `<Button>` — primary (violet bg + glow) / secondary (white/8 + border) / ghost
- `<Pill>` — violet-on-violet eyebrow tag

These are the only building blocks. New screens should compose from these, not introduce new primitives.

---

## 8 · Non-goals (explicit for v1)

- No fiat on/off-ramp.
- No mainnet support (testnet only until Arc Mainnet launches).
- No notifications (no email, no SMS, no Slack).
- No teams / multi-creator (single-wallet creator surface only).
- No invoicing (no line items, no PDF export — receipt is the deliverable).
- No analytics dashboard for the creator beyond `Total collected / Links / Paid` KPIs.

If a stakeholder asks for one of these, the answer is "v2."

---

## 9 · Success metrics

If we hit these in the first 90 days post-launch, v1 is a success.

| Metric | Target |
|---|---|
| **Time to first link created** (from landing page to `/pay/[slug]`) | <60s |
| **Pay completion rate** (links opened → paid) | ≥40% |
| **Mobile share rate** (Share button taps / pay screen visits) | ≥25% |
| **Bridge usage** (CCTP / Unified Balance payments / total paid) | ≥30% — proves the multi-chain value prop |
| **Lighthouse mobile score** | ≥90 for Performance, Accessibility, Best Practices, SEO |

---

## 10 · Open design questions

Things I'd love the designer to push back on / propose alternatives for.

1. **The 4-step flow card.** Today it's a vertical list. Could be a horizontal stepper (matches Stripe/Plaid). Which feels more native on mobile?
2. **QR code on the pay screen.** Lives inside the same `<Card>` as the amount. Should it be its own card? Should it dismiss after the payer connects a wallet?
3. **The amber demo banner.** Visible on every page. Is that too loud? Should it collapse after dismiss?
4. **Pay buttons hierarchy.** Currently: primary (Pay on Arc) + 3 bridge chains + Unified Balance. Five CTAs on one screen is a lot. Maybe collapse the bridge chains into a single "Bridge from another chain" picker?
5. **Receipt as an artifact.** Currently a webpage. Should there be a downloadable PNG/PDF version? A signed receipt card you can drop into Notion?
6. **Cancel UX.** Custom confirm modal is good, but no undo. Should a cancellation have a 30-second undo window before the on-chain `cancelLink` actually fires?
7. **Dashboard density.** One card per link. For someone with 50 links, does this break down? Should there be a compact table view at a breakpoint?
8. **Wallet connect entry.** RainbowKit's default modal is functional but generic. Worth a branded wallet picker? Or stay with RainbowKit for the network effects?

---

## 11 · Deliverables we need from design

To go from this PRD to a buildable prototype:

1. **High-fidelity Figma frames** for every screen × state in §5.
2. **A short Loom (or recorded screen-share)** walking through Flow A → Flow B → Flow C, narrating the design decisions.
3. **A revised set of color tokens** if the designer wants to tweak the palette (commit-ready hex codes — engineering will update `tailwind.config.ts`).
4. **Type spec table** — if anything in §7.2 should change, please ship it as a table not a screenshot.
5. **Motion specs** for any animations beyond the existing 200ms ease.
6. **Empty-state illustrations** *if* the designer wants to push past the current icon-in-a-card pattern. Optional but welcome.

---

## 12 · References

- **Live build**: https://onelink-mauve-nu.vercel.app
- **Repo**: https://github.com/Pratiikpy/onelink
- **Screenshots**: [`docs/screenshots/`](./screenshots/)
- **Engineering README** (architecture, launch checklist, security trade-offs): [`README.md`](../README.md)
- **Contributor guide**: [`CONTRIBUTING.md`](../CONTRIBUTING.md)
- **Stripe Payment Links** (the mental model for non-crypto folks): https://stripe.com/payments/payment-links
- **Circle App Kit docs**: https://docs.circle.com
- **Arc Testnet docs**: https://docs.arc.io

---

*Questions / objections / "this is wrong because" → file an issue on the repo or DM Pratik. Iterate this doc as we learn.*
