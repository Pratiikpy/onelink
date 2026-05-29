# OneLink — Product Info

> Pure product facts. Features, flows, mechanics, scope, technology, settlement model, verification, and limits. Nothing about UI, UX, layout, design system, brand, or visual direction.

Last updated: 2026-05-28

---

## 1. What OneLink is

OneLink is a **USDC payment-link product**. A creator publishes a single shareable link or a permanent profile handle. A payer opens that link, picks a supported route, signs a wallet transaction, and the server records the final paid state only after Arc Testnet on-chain verification.

- **Network:** Arc Testnet (chain id `5042002`)
- **Token:** USDC (Arc Testnet ERC-20 at `0x3600000000000000000000000000000000000000`, native gas token on Arc)
- **Live deployment:** `https://onelink-mauve-nu.vercel.app`
- **Settlement contract:** `OneLinkCollect.sol` deployed on Arc Testnet

---

## 2. Audiences

| Audience | Use case |
| --- | --- |
| Independent designers, devs, freelancers (primary) | "Pay me 250 USDC for the branding work" — share one link, get paid |
| Crypto-native teams / DAOs | Recurring contributor payouts |
| Web3 founders | Beta sub fees, ad-hoc charges |
| The payer (secondary but critical) | "I owe Pratik USDC, here's a link" — pay through the route they already have |

### Anti-personas (out of scope)

- High-volume merchants (no API, no inventory, no SKU tracking)
- Card / ACH / fiat payers (USDC-only by design)
- Custodial users (the product never holds keys)

---

## 3. Core promise

A successful product run satisfies all four:

1. **Create a link in under 30 seconds** — amount, memo, recipient (defaults to connected wallet), optional expiry.
2. **Pay through a supported route** — direct USDC on Arc Testnet, or bridge funded Base Sepolia USDC to Arc via Circle CCTP.
3. **Receipt is visible quickly** — on-chain settlement, Arcscan transaction link, status flips to paid.
4. **Track every link** — creator dashboard with copy / open / cancel / receipt actions per link.

---

## 4. Functional features

| # | Feature | Status |
| --- | --- | --- |
| 1 | Create USDC payment link (amount, memo, recipient, optional expiry) | Live |
| 2 | Pay link directly on Arc Testnet (approve + payLink) | Live |
| 3 | Bridge & pay from Base Sepolia → Arc via Circle CCTP | Live |
| 4 | Permanent freelancer profile handle at `/{handle}` (payer enters amount + memo) | Live |
| 5 | Verified Arc Testnet receipt with Arcscan transaction proof | Live |
| 6 | QR for cross-device hand-off | Live |
| 7 | Native share-sheet (Web Share API with clipboard fallback) | Live |
| 8 | Creator dashboard with KPI roll-up and per-link actions | Live |
| 9 | Cancel link (creator-only, unpaid-only, on-chain `cancelLink`, irreversible) | Live |
| 10 | Demo / preview mode for unconfigured deploys (visibly marked, no real settlement) | Live |
| 11 | Server-verified state transitions for paid and cancelled | Live |
| 12 | Pre-flight USDC balance check + Circle faucet helper for low balance | Live |
| 13 | Pre-flight chain hint + auto-switch to Arc | Live |
| 14 | Live CCTP step timeline (approve → burn → attestation → mint → settle → receipt) | Live |
| 15 | Receipt proof drawer (chain id, contract, token, tx hash, method, server-verified flag, Arcscan link) | Live |
| 16 | WalletConnect QR pairing and signed Arc payment | Live |
| 17 | Failure-state coverage (rejected wallet, expired link, cancelled link, insufficient USDC, wrong chain, bridge failure) | Live |
| 18 | Circle Gateway unified-balance checkout | **Implemented but gated** until funded end-to-end proof |
| 19 | Bulk link generation + CSV import | Out of scope (v2) |
| 20 | Webhooks for paid links | Out of scope (v2) |
| 21 | Multi-recipient / split payments | Out of scope (v2) |
| 22 | Mainnet support | Out of scope (v2) |

---

## 5. Payment routes

### 5.1 Arc-direct (live-proven)

The payer already holds USDC on Arc Testnet.

1. Wallet switches to Arc Testnet (chain id `5042002`).
2. Wallet calls `approve(OneLinkCollect, amount)` on the Arc USDC contract.
3. Wallet calls `payLink(linkId)` (or `payRecipient(paymentId, recipient, amount)` for profile flows) on `OneLinkCollect`.
4. Server polls Arc for the matching `PaymentCompleted` event and persists the verified state.
5. Receipt page exposes the Arcscan transaction.

### 5.2 Base Sepolia → Arc via Circle CCTP (live-proven)

The payer holds USDC on Base Sepolia and wants to settle on Arc.

1. Circle App Kit (`@circle-fin/app-kit` + `@circle-fin/adapter-viem-v2`) orchestrates `kit.bridge()` from `Base_Sepolia` to `Arc_Testnet`.
2. App Kit emits sequential events that drive the on-screen timeline:
   - `bridge.approve` — ERC-20 allowance on Base Sepolia
   - `bridge.burn` — CCTP burn on Base Sepolia
   - `bridge.fetchAttestation` — Circle IRIS attestation
   - `bridge.mint` — CCTP mint on Arc Testnet
3. After mint, the standard Arc-direct settlement runs (approve + payLink).
4. Server polls Arc for the matching event and persists the verified state.

### 5.3 Other testnet bridge sources (beta)

`SUPPORTED_SOURCE_CHAINS` in `lib/arc.ts` includes Ethereum Sepolia, Arbitrum Sepolia, and Polygon Amoy in addition to Base Sepolia. Only Base Sepolia → Arc has been live-proven; the others remain beta until each receives the same end-to-end proof.

### 5.4 Circle Gateway unified balance (implemented, gated)

Implemented in `lib/circle-payments.ts` + `lib/gateway.ts` + `app/api/gateway/balances/route.ts` + `app/api/gateway/transfer/route.ts`. **Disabled in checkout via `NEXT_PUBLIC_ENABLE_GATEWAY` until a funded deposit, burn, and mint flow is proven end to end.** A local end-to-end harness exists at `scripts/qa-local-gateway.mjs`.

The full Gateway flow when enabled:

1. Server fetches the payer's unified USDC balance across supported testnet chains via `/v1/balances` on the Circle Gateway testnet API.
2. The server selects a non-Arc source chain with sufficient balance (preferring the chain the payer's wallet is currently connected to).
3. The wallet signs an EIP-712 burn intent against the Gateway Wallet contract.
4. Server posts the signed burn intent to `/v1/transfer` and receives a mint attestation + signature.
5. The wallet calls `gatewayMint(attestation, signature)` on the Gateway Minter on Arc.
6. After mint, the standard Arc-direct settlement runs (approve + payLink).

Key Gateway constants (testnet):
- Gateway API base URL: `https://gateway-api-testnet.circle.com/v1`
- Gateway Wallet: `0x0077777d7EBA4688BDeF3E311b846F25870A19B9`
- Gateway Minter: `0x0022222ABE238Cc2C7Bb1f21003F0a260052475B`
- Arc CCTP domain: `26`
- Max fee on burn intent: `2.01 USDC` (in 6-decimal units)

---

## 6. Settlement model and trust boundaries

| Boundary | Rule |
| --- | --- |
| Browser | Can request actions but cannot mark settlement complete. |
| API routes | Verify Arc transaction receipts and contract-event logs before mutating trusted state. |
| Supabase | Stores public payment metadata behind RLS; an immutability trigger locks terminal states. |
| Arc contract | `OneLinkCollect.sol` is the source of truth for registered, paid, and cancelled links. |
| Circle bridge / Gateway | Move USDC into the Arc settlement path; Arc is always the destination. |

### Server-verified state transitions

- `unpaid → paid`: server verifies a `PaymentCompleted` Arc event matching link id, payer, amount, fee.
- `unpaid → cancelled`: server verifies a `PaymentLinkCancelled` Arc event matching link id and creator.
- `unpaid → expired`: read-time computed against `expiresAt`.

The browser cannot bypass these gates. Anonymous direct writes to Supabase are rejected by RLS.

---

## 7. Settlement contract — `OneLinkCollect.sol`

Deployed on Arc Testnet. Solidity 0.8.28. Foundry tested (27 tests passing).

### Public state-changing functions

- `createLink(bytes32 linkId, address recipient, uint256 amount, uint64 expiresAt)` — registers a payment link. Reverts on duplicate `linkId`, zero recipient, or zero amount.
- `payLink(bytes32 linkId)` — pays a registered link. Pulls `amount` USDC from `msg.sender` via `transferFrom`. Splits the optional fee. Marks the link paid.
- `payRecipient(bytes32 paymentId, address recipient, uint256 amount)` — direct payment to a recipient identified by a deterministic id, used by profile flows. Reverts on duplicate `paymentId`.
- `cancelLink(bytes32 linkId)` — only the creator, only on unpaid + non-cancelled + non-expired links. Marks the link cancelled.

### Public view function

- `getLink(bytes32 linkId) returns (creator, recipient, amount, expiresAt, paid, cancelled)`.

### Events

- `PaymentLinkCreated(bytes32 indexed linkId, address indexed creator, address indexed recipient, uint256 amount, uint64 expiresAt)`
- `PaymentCompleted(bytes32 indexed linkId, address indexed payer, address indexed recipient, uint256 grossAmount, uint256 feeAmount)`
- `PaymentLinkCancelled(bytes32 indexed linkId, address indexed creator)`

### Fee model

- Constructor enforces `feeBps <= 100` (1% maximum).
- Constructor rejects zero fee recipient and zero USDC address.
- Owner can update the fee config; new fee recipient cannot be zero.
- Fuzz-tested for clean integer split across the full uint16 fee range.

---

## 8. Off-chain data model

`payment_links` table in Supabase (per `supabase/schema.sql`):

| Column | Meaning |
| --- | --- |
| `id` | Internal UUID; receipt URL identifier |
| `slug` | Public URL slug, derived from memo + amount + nanoid |
| `creator_wallet`, `recipient_wallet` | Creator-controlled identity and payout address |
| `amount_usdc`, `memo`, `expires_at` | Invoice terms |
| `status` | `unpaid`, `processing`, `paid`, `failed`, `cancelled`, `expired` |
| `tx_hash`, `paid_at`, `cancelled_at` | Verified on-chain proof fields |
| `payer_wallet`, `payment_method`, `source_chain` | Settlement context |
| `contract_link_id` | `keccak256("onelink:<slug>")`, deterministic Arc contract id |
| `settlement_mode` | `invoice` or `profile` |
| `created_at`, `updated_at` | Timestamps |

### RLS and immutability

- RLS rejects anonymous direct insert / update of standard invoices.
- Immutability trigger locks `status` once it is in a terminal state (`paid` or `cancelled`).
- Profile-payment rows are payer-initiated; unpaid profile rows are not exposed to creator dashboards until the matching Arc event is verified.

### LocalStorage fallback

When Supabase env vars are absent, the app runs in **demo mode** using `localStorage`. Receipts produced in demo mode use a `0xDEM0…` prefixed pseudo-tx-hash and are explicitly labelled non-on-chain. The production-build safety throw in `lib/contracts.ts` blocks demo deploys without `NEXT_PUBLIC_ALLOW_DEMO=true`.

---

## 9. API routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/payments/create` | POST | Verify Arc `PaymentLinkCreated` event before persisting an invoice |
| `/api/payments/reconcile` | POST | Poll Arc for the matching `PaymentCompleted` event and persist `paid` state |
| `/api/payments/cancel` | POST | Verify Arc `PaymentLinkCancelled` event and persist `cancelled` state |
| `/api/profiles` | POST | Verify wallet-signed handle claim message and persist a freelancer profile |
| `/api/gateway/balances` | POST | Forward to Circle Gateway testnet `/balances` for the supplied depositor address |
| `/api/gateway/transfer` | POST | Forward burn intent + signature to Circle Gateway testnet `/transfer` |

Server-only Supabase service-role writes are scoped to these routes.

---

## 10. Wallet support

| Wallet integration | Status |
| --- | --- |
| RainbowKit / EIP-1193 browser-wallet UI creation and settlement | Live |
| WalletConnect QR pairing and signed Arc payment | Live |
| Wallet auto-switch to Arc Testnet | Live |
| Wallet auto-switch to Base Sepolia for the bridge route | Live |
| Wallet auto-switch back to Arc Testnet for Gateway mint | Implemented (gated until Gateway is enabled) |

---

## 11. Tech stack

| Layer | Choice |
| --- | --- |
| App framework | Next.js 15 App Router |
| Runtime | React 19 |
| Language | TypeScript |
| Wallet / RPC | wagmi + viem + RainbowKit + WalletConnect / Reown |
| Settlement chain | Arc Testnet (chain id `5042002`, RPC `https://rpc.testnet.arc.network`) |
| Bridge | Circle App Kit (`@circle-fin/app-kit` + `@circle-fin/adapter-viem-v2`), CCTP |
| Gateway | Circle Gateway testnet API + on-chain `gatewayMint` (gated) |
| Smart contract | Solidity 0.8.28, Foundry test harness |
| Storage | Supabase (Postgres + RLS + immutability trigger), localStorage fallback |
| Hosting | Vercel production deployment |

Pinned overrides in `package.json`:

- `cuer.qr` → `0.5.5`
- `ws` → `^8.20.1`
- `uuid` → `^11.1.1`
- `use-sync-external-store` → `^1.6.0`

---

## 12. Verification suite

Local commands:

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint across the whole app |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` |
| `npm run build` | Production Next.js build for every route |
| `npm run test:contracts` | 27 Foundry tests on `OneLinkCollect.sol` |

Live (against the public Vercel deployment):

| Command | Spends testnet funds | Purpose |
| --- | --- | --- |
| `npm run qa:live:visual` | No | Screenshot every public surface at multiple widths |
| `npm run qa:live:browser-wallet` | Yes | Full create → approve → pay → refresh → receipt cycle |
| `npm run qa:live:walletconnect-payment` | Yes | WalletConnect QR pairing and signed Arc payment |
| `npm run qa:live:bridge-payment-ui` | Yes | Base Sepolia → Arc CCTP bridge end-to-end |
| `npm run qa:live:profile-payment` | Yes | Permanent profile payment cycle |
| `npm run qa:live:cancel` | Arc gas only | Verified creator cancellation |
| `npm run qa:live:failure-states` | Arc gas only (creates a link, never pays) | Rejected-wallet, expired-link, cancelled-link UX |
| `npm run qa:live:walletconnect-modal` | No | WalletConnect QR-modal capture |

Local Gateway proof harness:

| Command | Spends testnet funds | Purpose |
| --- | --- | --- |
| `npm run qa:local-gateway` | Yes (Base Sepolia USDC + ETH) | Spawns local Next.js with `NEXT_PUBLIC_ENABLE_GATEWAY=true`, deposits into Circle Gateway from Base Sepolia, signs the burn intent, mints on Arc, settles the OneLink invoice, and asserts Supabase reconciliation |

Each live QA writes a `REPORT.md` and a `result.json` under `docs/test-results/<flow>/`.

---

## 13. Verified scope

Live-proven on the public Vercel deployment:

- Arc direct payment
- Browser-wallet full flow (create + approve + pay + refresh + receipt)
- WalletConnect QR pairing and signed Arc payment
- Base Sepolia → Arc bridge through Circle App Kit and CCTP
- Permanent freelancer profile payment (payer-initiated)
- Verified creator cancellation
- Failure-state recovery (rejected wallet, expired link, cancelled link)
- Visual / responsive smoke at five widths

Implemented but **not** live-proven:

- Circle Gateway unified-balance checkout (gated behind a feature flag, harness exists, requires funded testnet wallets to run end-to-end)
- Bridging from Ethereum Sepolia, Arbitrum Sepolia, Polygon Amoy (defined as sources, not yet given the same proof standard as Base Sepolia)

---

## 14. Out of scope

| Area | Status |
| --- | --- |
| Mainnet (Arc, Base, anywhere else) | Not in scope; testnet only |
| Solana | Not implemented |
| Fiat / card / ACH | Not implemented |
| "Any blockchain" instant settlement | Not claimed; only the listed supported routes |
| Bulk / CSV link generation | Not implemented (v2) |
| Webhooks (Slack / email / etc.) | Not implemented (v2) |
| Multi-recipient or split payments | Not implemented (v2) |
| Notifications (email / SMS / Slack) | Not implemented (v2) |
| Teams / multi-creator accounts | Not implemented (v2) |
| Subscriptions / recurring billing | Not implemented (v2) |
| Identity / reputation registry (ERC-8004 / ERC-8183) | Not implemented (v2) |
| Custodial key holding | Never; OneLink does not hold keys |

---

## 15. Limits and known constraints

| Limit | Current value |
| --- | --- |
| Maximum amount per link | 1,000,000 USDC (hard-capped) |
| USDC decimal precision | 6 |
| Native gas decimals on Arc | 18 (when reading `nativeCurrency`); 6 for ERC-20 USDC operations |
| Platform fee | Configurable; constructor enforces `feeBps <= 100` (1% max); production fee bps from `NEXT_PUBLIC_PLATFORM_FEE_BPS` |
| Memo | Required, free text |
| Expiry | Optional; if set, must be future |
| Single-use link | Yes; first valid `payLink` wins |
| Cancel cool-down | None (cancel is on-chain, irreversible) |
| Demo / preview mode | Active when `NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS` is unset; demo receipts are visibly marked and do not claim real settlement |

---

## 16. Environment variables

Public (browser-visible):

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_PLATFORM_FEE_BPS`
- `NEXT_PUBLIC_KIT_KEY` (optional, for Circle App Kit features that require a kit key)
- `NEXT_PUBLIC_ENABLE_GATEWAY` (`"true"` to enable the gated Gateway route)
- `NEXT_PUBLIC_ALLOW_DEMO` (`"true"` to allow a production deploy without a contract address)

Server-only:

- `ARC_TESTNET_RPC_URL`
- `BASE_SEPOLIA_RPC_URL`
- `DEPLOYER_PRIVATE_KEY` (Foundry; must never be committed)
- `FEE_RECIPIENT`
- `SUPABASE_SERVICE_ROLE_KEY` (must never be committed)
- `QA_PAYER_PRIVATE_KEY` (live QA scripts; must never be committed)
- `QA_GATEWAY_AMOUNT_USDC`, `QA_GATEWAY_DEPOSIT_USDC`, `QA_GATEWAY_PORT` (Gateway harness tuning)

---

## 17. Repository layout

```
app/                 Next.js routes, API handlers, whitepaper, trust pages
components/          Shared product flows (Arc pre-flight, bridge timeline, gateway timeline, proof drawer, etc.)
contracts/           OneLinkCollect Solidity contract and Foundry tests
lib/                 Arc, Circle Gateway, payment, storage, share, profiles, contracts utilities
scripts/             Live QA and deployment verification scripts (qa-live-*.mjs, qa-local-gateway.mjs)
supabase/            Database schema, RLS policies, immutability trigger
docs/                Launch readiness, architecture, PRD, security review, pitch deck brief, screenshots, test-results
```

Key product files:

- `lib/arc.ts` — Arc Testnet constants, supported source chains, demo-tx detection
- `lib/circle-payments.ts` — bridge orchestration with App Kit, gated Gateway spend with EIP-712 burn intent
- `lib/gateway.ts` — Circle Gateway testnet sources, EIP-712 typed data, minter ABI
- `lib/contracts.ts` — `OneLinkCollect` ABI, ERC-20 ABI, contract address gate, demo-mode safety throw
- `lib/storage.ts` — Supabase + localStorage abstraction; verified state transitions
- `lib/payments.ts` — slug, contract link id, status helpers, payment-method labels

---

## 18. Settlement-language rules

The product never claims:

- Mainnet readiness
- Solana support
- "Any blockchain"
- Automatic payment from arbitrary wallet funds on arbitrary chains
- Circle Gateway as a proven live route

The product always claims, and only claims:

- Arc Testnet direct settlement (proven)
- Base Sepolia → Arc CCTP route (proven)
- WalletConnect QR pairing and signed Arc payment (proven)
- Permanent profile payment (proven)
- Verified creator cancellation (proven)
- Server-verified final state for `paid` and `cancelled`
- Gateway is implemented and gated until separately proven end to end

---

## 19. Glossary

| Term | Meaning |
| --- | --- |
| **Arc** | Circle's USDC-native blockchain. Currently testnet-only. |
| **Arc Testnet** | The deployment target, chain id `5042002`. |
| **Arcscan** | The Arc Testnet block explorer at `https://testnet.arcscan.app`. |
| **CCTP** | Circle Cross-Chain Transfer Protocol — burn USDC on a source chain, mint on a destination chain. |
| **Circle App Kit** | `@circle-fin/app-kit` + adapter packages. SDK that wraps CCTP and Gateway flows. |
| **Circle Gateway** | Unified USDC balance across multiple chains. Implemented but gated until a funded end-to-end proof. |
| **Link** | A payment-link record, identified by a `bytes32 linkId` on-chain and a slug off-chain. |
| **Profile / handle** | A permanent `/{handle}` page tied to a wallet for ad-hoc payments without specific invoices. |
| **Receipt** | A `/receipt/[id]` page that exposes the verified Arc settlement transaction. |
| **Reconciliation** | The server-side check that verifies an Arc event before persisting paid or cancelled state. |
| **Demo mode** | The localStorage-only fallback when production env vars are missing; receipts are explicitly non-on-chain. |
| **Source chain** | A chain a payer holds USDC on before bridging or Gateway-spending into Arc. |
| **Settlement chain** | Always Arc Testnet. |

---

## 20. Quick facts

- Deployed live: **yes** — `https://onelink-mauve-nu.vercel.app`
- Smart contract: **deployed and verified on Arc Testnet**, 27 Foundry tests passing
- Server reconciliation: **active**, gates every `paid` and `cancelled` state transition
- Live live-test scripts: **8 destructive, 2 non-destructive**, all under `scripts/`
- Documented evidence: every claimed route has a matching report under `docs/test-results/<flow>/REPORT.md`
- Supported route count today: **2 verified (Arc-direct, Base Sepolia → Arc CCTP)** + **1 implemented gated (Circle Gateway)** + **3 beta CCTP sources (Eth Sepolia, Arb Sepolia, Polygon Amoy)**

---

*This document intentionally omits anything about UI, UX, layout, design system, brand, typography, color, responsive behavior, animations, copy direction, or visual feel. For those, read the PRD, the UI/UX audit, and the pitch deck brief separately.*
