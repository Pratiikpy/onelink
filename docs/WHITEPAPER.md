# OneLink — Technical Whitepaper

> **One link. Supported USDC routes. Verified on Arc.**

OneLink Collect is a mobile-first web application for USDC payment links that
settle on **Arc Testnet** and are **verified on-chain by a server before any
final state is shown**. This document describes the architecture, the
settlement contract, the verification model, the payment routes, the data and
identity layers, the security posture, and the verified scope.

- **Live:** https://onelink-mauve-nu.vercel.app
- **Settlement contract:** `OneLinkCollect` at
  `0x9b7D5B4DAD4c9B1065908FA8C6C34d697E3cBD0c` (Arc Testnet, chain `5042002`)
- **USDC (ERC-20):** `0x3600000000000000000000000000000000000000`
- **Verified deployment:** `dpl_6CAmiBa1DNkiiw4MgkAS4TQ2T62F`

---

## 1. Abstract

A payment is only trustworthy if its *paid* state corresponds to a real
on-chain settlement. OneLink enforces this with a single principle —
**settlement before status** — implemented as a server that decodes and matches
the on-chain event emitted by the `OneLinkCollect` contract before it writes a
`paid` (or `cancelled`) record. The client can request a state change; only the
chain can justify it. Every receipt therefore anchors to a verifiable Arc
transaction.

---

## 2. Design principle: settlement before status

- The front-end never self-certifies a payment.
- An API route (`/api/payments/*`) fetches the transaction receipt from Arc,
  `decodeEventLog`s it against the contract ABI, and confirms the event
  arguments match the link's expected values **before** persisting.
- This holds for three transitions: invoice **creation**, final **paid**, and
  final **cancelled**.

There is no code path in which the UI alone can fabricate a settlement.

---

## 3. System architecture

```
Creator wallet ──signs createLink──▶ Arc (OneLinkCollect)
        │                                   │ emits PaymentLinkCreated
        ▼                                   ▼
  /api/payments/create ──verifies event──▶ Supabase (payment_links)   [demo mode → localStorage]
        │
Payer wallet ──approve + payLink / bridge+settle / gateway-spend──▶ Arc
        │                                   │ emits PaymentCompleted
        ▼                                   ▼
  /api/payments/reconcile ──verifies event──▶ Supabase: status = paid
        │
        ▼
  /receipt/[id] ── renders the verified Arcscan tx + server-verified flag
```

- **Client (Next.js 15 App Router, React 19):** server components by default;
  wallet flows are client components using wagmi/viem/RainbowKit.
- **Settlement (Arc Testnet):** the `OneLinkCollect` contract holds the
  authoritative link state and emits the events the server verifies.
- **Verification + persistence (Vercel serverless + Supabase):** API routes
  verify events and write state with a service-role client; RLS prevents
  unauthenticated tampering.
- **Demo mode:** with no contract/Supabase configured, the app runs from
  `localStorage` with `0xDEM0…` pseudo-hashes — explicitly labeled, never in
  production.

---

## 4. The `OneLinkCollect` contract

Solidity `^0.8.28` (MIT), built and tested with Foundry (`optimizer_runs 200`),
settling USDC via `IERC20.transferFrom`. **27/27 Foundry tests pass.**

### 4.1 Functions

| Function | Purpose |
| --- | --- |
| `createLink(bytes32 linkId, address recipient, uint256 amount, uint64 expiresAt)` | Register an invoice link |
| `payLink(bytes32 linkId)` | Pay a registered invoice link |
| `payRecipient(bytes32 paymentId, address recipient, uint256 amount)` | Profile (handle) payment to a recipient |
| `cancelLink(bytes32 linkId)` | Creator-only cancellation of an open link |
| `getLink(bytes32 linkId) view` | Read link state |
| `setFeeConfig(address, uint16) onlyOwner` | Update fee recipient + bps (capped) |
| `transferOwnership(address) onlyOwner` | Ownership transfer |

### 4.2 Events (what the server verifies)

- `PaymentLinkCreated(linkId, creator, recipient, amount, expiresAt)`
- `PaymentCompleted(linkId, payer, recipient, grossAmount, feeAmount)`
- `PaymentLinkCancelled(linkId, creator)`
- `FeeConfigUpdated(feeRecipient, feeBps)`
- `OwnershipTransferred(previousOwner, newOwner)`

### 4.3 Fee model (hard-capped)

- `feeBps` is bounded: the constructor and `setFeeConfig` **revert
  `FeeTooHigh` if `feeBps > 100`** — a protocol-enforced **1% maximum**.
- Fee math: `feeAmount = (amount * feeBps) / 10_000`, deducted at settlement;
  `PaymentCompleted` carries both `grossAmount` and `feeAmount`.

### 4.4 Safety / invariants (custom errors)

`NotOwner`, `NotCreator`, `InvalidRecipient`, `InvalidAmount`,
`LinkAlreadyExists`, `LinkNotFound`, `LinkAlreadyPaid`, `LinkCancelled`,
`LinkExpired`, `FeeTooHigh`, `TransferFailed`. These enforce: unique link ids,
creator-only cancellation, no double-pay, expiry handling, valid
recipient/amount, the fee cap, and a checked token transfer.

### 4.5 Link identity

`linkId = keccak256("onelink:" + slug)` (`makeContractLinkId`). The slug is
derived from the memo + amount; the server re-derives and matches the linkId
from the URL when verifying creation, so a forged invoice cannot be persisted.

---

## 5. Server-verified settlement model

`/api/payments/create` (representative of the pattern):

1. Requires `HAS_CONTRACT` + Supabase env, else returns `503` (demo mode does
   this client-side via `localStorage`).
2. Builds a viem `createPublicClient({ transport: http(ARC_RPC_URL) })`.
3. Fetches the submitted transaction receipt and `decodeEventLog`s it against
   `oneLinkCollectAbi`.
4. Confirms the decoded `PaymentLinkCreated` args (`linkId`, `creator`,
   `recipient`, `amount`, `expiresAt`) match the request and the URL-derived
   link id.
5. Only then upserts the invoice into the Supabase `payment_links` table with
   the service-role client.

`reconcile` and `cancel` apply the same verify-then-write pattern for the final
`paid` and `cancelled` states. All money-touching routes are rate-limited
(`lib/rate-limit.ts`; e.g. create is 20 requests / 60s) and return generic,
non-leaking error messages.

---

## 6. Payment routes

### 6.1 Arc-direct (default, proven)
Payer holds USDC on Arc. Two transactions: `approve` (USDC → contract) then
`payLink`. The server verifies `PaymentCompleted` before marking paid.

### 6.2 Bridge via Circle CCTP + App Kit (proven: Base Sepolia → Arc)
`lib/circle-payments.ts` dynamically imports `@circle-fin/app-kit` +
`@circle-fin/adapter-viem-v2` and calls
`kit.bridge({ from: { chain: source.appKitName }, to: { chain: "Arc_Testnet", recipientAddress }, amount })`,
surfacing step events `approve → burn → fetchAttestation → mint`. Native USDC is
burned on the source chain and minted on Arc, then settled in the same flow.
Supported sources: **Base Sepolia (84532, proven)**; Ethereum Sepolia
(11155111), Arbitrum Sepolia (421614), Polygon Amoy (80002) are beta.

### 6.3 Unified balance via Circle Gateway (implemented, GATED)
Hand-rolled in `lib/gateway.ts` (no SDK): EIP-712 burn-intents
(`domain { name: "GatewayWallet", version: "1" }`, `BurnIntent` / `TransferSpec`
types) against the Gateway API (`https://gateway-api-testnet.circle.com/v1`),
Gateway wallet `0x0077777d7EBA4688BDeF3E311b846F25870A19B9`, minter
`0x0022222ABE238Cc2C7Bb1f21003F0a260052475B`, Arc destination domain `26`.
**Disabled in checkout** behind `NEXT_PUBLIC_ENABLE_GATEWAY === "true"`
(`ENABLE_GATEWAY_ROUTE`) until a funded end-to-end proof is run.

---

## 7. Arc integration

`lib/arc.ts` constants:

| Constant | Value |
| --- | --- |
| `ARC_CHAIN_ID` | `5042002` |
| `ARC_RPC_URL` | `https://rpc.testnet.arc.network` |
| `ARC_EXPLORER_URL` | `https://testnet.arcscan.app` |
| `ARC_USDC_ADDRESS` | `0x3600000000000000000000000000000000000000` |
| `ARC_FAUCET_URL` | `https://faucet.circle.com` |
| `USDC_DECIMALS` | `6` (ERC-20); native gas is USDC (18 decimals) |

USDC is Arc's **native gas token**, so a payer never needs ETH. `amountToUnits`
uses `parseUnits(amount, 6)`.

---

## 8. Data & identity layers

### 8.1 Persistence (`lib/storage.ts`)
Supabase (`@supabase/supabase-js`) for cross-device metadata, gated by
server-side verification; a `localStorage` fallback powers demo mode. Supabase
migrations enforce the same invariants from the database side:
`initial_onelink_schema`, `tighten_payment_rls_and_function_search_path`,
`require_verified_payment_cancellation`, `require_verified_invoice_creation`
(0 Supabase security advisor lints). Anonymous standard-invoice insertion is
rejected; unpaid profile rows are hidden from the creator dashboard.

### 8.2 Demo mode (`lib/contracts.ts`)
`HAS_CONTRACT` / `IS_DEMO_MODE` derive from
`NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS`. When unset, the app runs in demo mode
(`0xDEM0…` hashes, no real settlement) and the UI **does not** assert on-chain
verification it cannot deliver. A production-safety throw blocks silent
demo-mode deploys unless `NEXT_PUBLIC_ALLOW_DEMO=true`.

### 8.3 Profile claims (EIP-712)
A permanent freelancer handle is claimed with an **EIP-712 typed-data
signature** (domain `{ name: "OneLink Collect", version: "1", chainId: 5042002 }`,
a `ProfileClaim` struct with `handle`/`owner`/`issuedAt`/`expiresAt`, ~600s TTL).
The server (`/api/profiles`) verifies the signature, binds owner == recipient
wallet and handle, enforces freshness, preserves the original `created_at`, and
is rate-limited — so a captured signature is not trivially replayable.

---

## 9. Security model

- **Contract:** capped fee, custom-error invariants, checked transfers,
  creator-only cancellation, no double-pay; 27 passing Foundry tests.
- **Server trust boundary:** final state requires a verified on-chain event;
  forged anonymous invoice creation and forged cancellation are rejected
  (proven in QA).
- **API hardening:** per-IP rate limiting on payment/gateway/profile routes;
  generic error responses (no raw upstream/RPC leakage); the Gateway transfer
  route validates the Arc destination domain.
- **App headers (`next.config.ts`):** `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, a restrictive `Permissions-Policy`,
  and HSTS (`max-age=63072000; includeSubDomains; preload`).
- **Supply chain:** vulnerable transitive `ws` and `uuid` paths patched via npm
  overrides (`^8.20.1`, `^11.1.1`); the Next.js-bundled `postcss` advisory is
  documented as accepted upstream risk; **no high/critical alerts accepted**.
- **Repository protections:** CodeQL (0 open alerts), secret scanning + push
  protection, Dependabot security updates, private vulnerability reporting, and
  required status checks on a protected `main`.
- **Accessibility:** `maximumScale: 5` (pinch-zoom preserved; WCAG 1.4.4).

---

## 10. Technology stack

| Layer | Choice (version) |
| --- | --- |
| Framework | Next.js `^15.1.7`, React `^19`, TypeScript `^5.7.3` (Node ≥22 <25) |
| Styling | Tailwind v3 (`^3.4.17`), shadcn/ui on Radix, `tw-animate-css`, Inter / Inter Tight / JetBrains Mono |
| Wallet / RPC | wagmi `^2.14.11`, viem `^2.23.5`, RainbowKit `^2.2.9`, `@tanstack/react-query`, WalletConnect / Reown |
| Circle | `@circle-fin/app-kit ^1.6.1`, `@circle-fin/adapter-viem-v2 ^1.11.1` (CCTP); hand-rolled Gateway (EIP-712) |
| Contract | Solidity `0.8.28`, Foundry (forge-std), 27 tests |
| Data | Supabase (`@supabase/supabase-js ^2.49.1`) + localStorage fallback |
| QA | Playwright `^1.60.0`, `jsqr`, `pngjs` — 12 live/local QA scripts |
| Hosting | Vercel |

Routes (pages): `/`, `/create`, `/dashboard`, `/pay/[slug]`, `/receipt/[id]`,
`/[handle]`, `/settings`, `/security`, `/privacy`, `/terms`, `/how-it-works`,
`/whitepaper`, `/pitch`, `/brand`. API: `/api/payments/{create,reconcile,cancel}`,
`/api/gateway/{transfer,balances}`, `/api/profiles`.

---

## 11. Verified scope & known limits

**Proven on the live deployment:** Arc-direct payment, WalletConnect signed
payment, Base Sepolia → Arc CCTP bridge, permanent profile payment, verified
receipts, creator cancellation, failure/recovery states, and a 5-viewport
visual sweep.

| Area | Current truth |
| --- | --- |
| Mainnet | Not in scope; testnet only |
| Solana | Not implemented |
| Circle Gateway checkout | Feature-gated off; no funded end-to-end proof yet |
| Additional bridge sources | Base Sepolia proven; others beta |
| Arbitrary-wallet auto-pay | Not claimed |

---

## 12. On-chain transaction proofs

| Flow | Transaction |
| --- | --- |
| Direct Arc settlement | `0x508ebf9ac99613534e82d768d423c0d30c274c57d30f0181c9cba6805e5ddd46` |
| Creator cancellation | `0x9a7d08580a5313cb97220c21e2011d6f042cc0c6db0349d75a4cafc46bdc5138` |
| Profile payment | `0xe6521e60bd25a01a82124ec22a368c9200480081b2708ffadcce23779aed0fea` |
| WalletConnect signed `payLink` | `0x911565693a254c25aeb3bf87e2bf5e3ba5dec697f659cb898434536b1d40140b` |
| Browser-wallet settlement | `0x6b921b06d601e88cf1cdb0ea1eb5237cd89dc7220c0ef2ab6b910f46b312c4ab` |
| CCTP burn (Base Sepolia) | `0x051298e44c02b47ddc99b708bd3060c9287bba6cc130444219b3197b7630a9db` |
| CCTP mint (Arc) | `0x7631260432ac0e65428f7286bae6ee1b3a2e6a5c2e86079154027ced0e97f79d` |
| Bridge settlement (Arc) | `0xc5ac72e58a77fd48c9f6781031557fbd63cc6c7556876f25b1bb218aea240ee3` |

Arc txs: `https://testnet.arcscan.app/tx/<hash>`. Full evidence bundle:
`docs/LAUNCH_READINESS.md`.

---

## 13. Reproduce

```bash
npm run lint
npm run typecheck
npm run build
npm run test:contracts          # Forge — 27 tests
npm run qa:live:direct          # live Arc settlement proof
npm run qa:live:bridge-payment-ui
npm run qa:live:walletconnect-payment
npm run qa:live:visual          # 5-viewport sweep
```

---

## 14. Glossary

- **Arc Testnet** — EVM L1 (chain `5042002`) where USDC is the native gas token.
- **CCTP** — Circle's Cross-Chain Transfer Protocol (native USDC burn-and-mint).
- **App Kit** — Circle's SDK powering the bridge flow.
- **Gateway** — Circle's unified-balance protocol (gated route).
- **Server-verified state** — a `paid`/`cancelled` record written only after the
  matching Arc event is decoded and matched server-side.
- **Demo mode** — contract/Supabase-less fallback using `localStorage` and
  `0xDEM0…` hashes; never used in production.

---

*Companion documents:* `docs/PITCH.md` (product/pitch), `docs/LAUNCH_READINESS.md`
(full proof + transaction ledger), `docs/SECURITY_REVIEW.md` (dependency posture),
`AGENTS.md` (build conventions).
