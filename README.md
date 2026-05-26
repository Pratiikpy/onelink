<div align="center">

# OneLink Collect

**One link. Supported USDC routes. Verified on Arc.**

Mobile-first USDC payment links that settle on **Arc Testnet**, with a live-proven Circle App Kit bridge route from Base Sepolia and server-verified receipts.

[**Open the live Arc Testnet app →**](https://onelink-mauve-nu.vercel.app)

<br />

![OneLink Collect — home](./docs/screenshots/home-desktop.png)

</div>

---

## What it does

OneLink turns a request like *"send me 250 USDC for the April invoice"* into a single shareable URL. The recipient pastes it in iMessage, Slack, or a tweet, and the payer can use the currently enabled routes:

- **Pay directly on Arc** — wallet already on Arc Testnet, one approve + one `payLink` call.
- **Bridge & pay** — Base Sepolia to Arc Testnet is proven live through Circle App Kit CCTP; Ethereum Sepolia, Arbitrum Sepolia, and Polygon Amoy are implemented testnet route options pending the same launch-proof run.
- **Permanent profile link** — a creator can publish `/{handle}` (for example `/prateek`) so a payer selects an amount and memo without requesting a new invoice URL.

Every standard invoice is registered in shared storage only after the server verifies the Arc `PaymentLinkCreated` event. Every real settlement emits an on-chain Arc event. With Supabase configured, the server verifies creation, settlement, and creator cancellation events before writing shared `invoice`, `paid`, or `cancelled` states.

Circle Gateway support is feature-gated off in production until a funded unified-balance payment is verified end-to-end.

---

## Product surface

### Landing

Launch landing page with an honest illustrative invoice, supported-route positioning, live-proof signals, and direct links to testnet safety scope.

![Landing — desktop](./docs/screenshots/home-desktop.png)

### Create a link

Mobile-first form with checksum validation, sane amount caps, and clear inline guidance.

![Create link — desktop](./docs/screenshots/create-desktop.png)

### Pay a link

A focused checkout with recipient, amount, expiry status, and wallet connection. Once connected, the payer can select a settlement path, see Arc USDC preflight feedback, and review testnet verification scope before signing.

<table>
  <tr>
    <td align="center" width="50%">
      <img src="./docs/screenshots/pay-unpaid-desktop.png" alt="Pay screen — desktop" />
      <br />
      <sub><b>Desktop</b></sub>
    </td>
    <td align="center" width="50%">
      <img src="./docs/screenshots/pay-unpaid-mobile.png" alt="Pay screen — mobile" />
      <br />
      <sub><b>Mobile</b></sub>
    </td>
  </tr>
</table>

### Receipt

Sealed, shareable proof of payment. Demo settlements are visually marked and never link out to Arcscan.

<table>
  <tr>
    <td align="center" width="50%">
      <img src="./docs/screenshots/receipt-paid-desktop.png" alt="Receipt — desktop" />
      <br />
      <sub><b>Desktop</b></sub>
    </td>
    <td align="center" width="50%">
      <img src="./docs/screenshots/receipt-paid-mobile.png" alt="Receipt — mobile" />
      <br />
      <sub><b>Mobile</b></sub>
    </td>
  </tr>
</table>

### Dashboard

Wallet-scoped empty state, responsive paid/request lists, working copy/open/receipt actions, verified creator cancellation for unpaid invoices, and roll-up of total collected.

![Dashboard — wallet not connected](./docs/screenshots/dashboard-disconnected-desktop.png)

### Trust center

User-facing security, privacy, and terms surfaces document testnet scope, reconciliation, public blockchain data, and wallet-safety expectations.

### Operator settings

An operational health panel, reachable directly for demo preparation, checks whether the contract, Supabase, WalletConnect, and public URL are wired up.

![Settings — environment health](./docs/screenshots/settings-desktop.png)

### 404

Branded not-found instead of the Next.js default.

![Not found](./docs/screenshots/notfound-desktop.png)

---

## Stack

|  |  |
| --- | --- |
| **Framework** | Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS |
| **Wallet** | wagmi · viem · RainbowKit |
| **Bridging** | `@circle-fin/app-kit` · `@circle-fin/adapter-viem-v2` |
| **Network** | Arc Testnet (chain id `5042002`) · USDC as native gas |
| **Contract** | Solidity 0.8.28 · Foundry · 27 tests incl. 256-run fuzz |
| **Storage** | Supabase (optional) with `localStorage` fallback |
| **CI** | GitHub Actions — lint · typecheck · build · forge test |
| **Hosting** | Vercel · security headers · OG image + favicon at edge |

---

## Quick start (local)

```bash
git clone https://github.com/Pratiikpy/onelink.git
cd onelink
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The app boots in **demo mode** — links live in `localStorage`, payments emit a `0xDEM0…` synthetic tx hash, the launch-settings panel identifies missing production wiring, and demo receipts state that no USDC moved on-chain.

### Verification suite

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run build       # Next.js production build
npm run test:contracts # 27 Solidity tests (needs Foundry)
npm run qa:live:direct # real Arc direct payment + live reconciliation proof
npm run qa:live:bridge # Base Sepolia -> Arc App Kit CCTP proof
npm run qa:live:bridge-payment-ui # live Bridge & pay UI route + settlement receipt
npm run qa:live:profile # wallet-signed permanent handle proof
npm run qa:live:profile-payment # live permanent handle -> Arc payment + receipt
npm run qa:live:visual # live production screenshots + videos
npm run qa:live:browser-wallet # actual UI create/pay with two browser wallet contexts and Arc txs
npm run qa:live:failure-states # missing/expired/insufficient/rejected/fake-proof cases
npm run qa:live:walletconnect-modal # production WalletConnect QR modal regression
npm run qa:live:walletconnect-payment # QR pair + WalletConnect signed Arc settlement proof
npm run qa:live:cancel # forged-cancellation rejection + creator-signed Arc cancellation proof
```

---

## Launch checklist

The live deployment is configured for real Arc Testnet settlement. The checklist below is retained so another operator can reproduce the deployment from a fresh project. Public profile handles are claimed through a wallet-signed server route.

### 1 · WalletConnect / Reown project ID (2 min)

Without this the mobile QR connect flow silently fails. Sign in at <https://cloud.reown.com>, create a project, copy the project ID.

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

### 2 · Deploy `OneLinkCollect.sol` to Arc Testnet (10 min)

Arc uses USDC as native gas. Fund the deployer at <https://faucet.circle.com>.

```bash
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
DEPLOYER_PRIVATE_KEY=0x...
FEE_RECIPIENT=0x...          # optional, defaults to deployer
PLATFORM_FEE_BPS=0           # 50 = 0.5 %, hard-capped at 100 (1 %)

forge script contracts/script/DeployOneLinkCollect.s.sol:DeployOneLinkCollect \
  --rpc-url arc_testnet \
  --broadcast
```

Set the returned address:

```bash
NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS=0x...
```

### 3 · Provision Supabase (5 min)

Without Supabase, a payer cannot load a link the creator made on another device.

1. Create a project at <https://supabase.com>.
2. SQL Editor → paste `supabase/schema.sql` → Run.
3. Project Settings → API → copy the URL and the **anon** key.
4. Copy the **service role** key for the server-only settlement verifier.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey... # server only; never expose as NEXT_PUBLIC
```

### 4 · Deploy to Vercel (5 min)

```bash
npm i -g vercel
vercel link
vercel env pull .env.local        # mirror env from Vercel into local
vercel deploy --prod
```

Set the same `NEXT_PUBLIC_*` envs in *Project Settings → Environment Variables*.

> Current production deployment: **<https://onelink-mauve-nu.vercel.app>**. It is configured with the deployed Arc Testnet contract, Supabase storage, server reconciliation, and WalletConnect/Reown QR connection UI. Demo mode is not the production claim.

### 5 · Smoke test

Open the production URL in wallet A, create an invoice and optionally claim a testnet profile handle. Open the link in wallet B. Test Arc direct settlement and Base Sepolia CCTP settlement. Confirm the tx on [Arcscan](https://testnet.arcscan.app) and verify the dashboard changes to paid only after reconciliation. Gateway must remain disabled unless its funded deposit-and-spend path is separately proven.

---

## Production safety

A `NODE_ENV=production` build refuses to render in the browser if `NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS` is missing. This prevents a misconfigured deploy from silently emitting demo "receipts" that don't move USDC.

Override only when demo mode in prod is intentional (a hackathon or marketing preview):

```bash
NEXT_PUBLIC_ALLOW_DEMO=true
```

The launch-settings health panel and receipt messaging distinguish intentional demo mode from real settlement.

---

## Architecture

```
app/
  page.tsx                 ·  Landing
  [handle]/page.tsx        ·  Permanent freelancer payment profile
  api/payments/create/     ·  Arc-event verified invoice registration
  api/payments/reconcile/  ·  Arc-event verified paid-state writer
  api/payments/cancel/     ·  Arc-event verified cancellation writer
  create/page.tsx          ·  Create
  security/page.tsx        ·  User-facing verification and testnet scope
  privacy/page.tsx         ·  Public-link and wallet privacy disclosure
  terms/page.tsx           ·  Testnet usage terms
  pay/[slug]/page.tsx      ·  Pay
  receipt/[id]/page.tsx    ·  Receipt
  dashboard/page.tsx       ·  Creator dashboard
  settings/page.tsx        ·  Environment health
  layout.tsx               ·  Global metadata · OG · Twitter cards · PWA viewport
  error.tsx                ·  Global error boundary
  not-found.tsx            ·  Branded 404
  icon.tsx                 ·  Dynamic PNG favicon
  apple-icon.tsx           ·  Dynamic 180×180 PWA touch icon
  opengraph-image.tsx      ·  Dynamic 1200×630 social card
  robots.ts · sitemap.ts   ·  SEO basics — pay/receipt URLs blocked
components/                ·  Client UI
lib/
  arc.ts                   ·  Network constants · explorerTx · isDemoTxHash
  contracts.ts             ·  ABI + production-safety throw
  payments.ts              ·  Slug / status types / label helpers
  circle-payments.ts       ·  App Kit CCTP and Gateway checkout execution
  profiles.ts              ·  Freelancer handle storage
  share.ts                 ·  useCopy hook + Web Share API
  storage.ts               ·  Supabase + localStorage abstraction
contracts/                 ·  Foundry project (27 tests, 256-run fuzz)
supabase/schema.sql        ·  Table + RLS + immutability trigger
.github/workflows/ci.yml   ·  Lint · typecheck · build · forge test
```

### Security trade-offs

Paid state is server-verified when Supabase is enabled:

- Standard invoice rows are inserted only through `/api/payments/create`, which verifies the Arc `PaymentLinkCreated` event, URL-derived `contract_link_id`, creator, recipient, amount, and expiry before writing with the service role.
- `contract_link_id` is unique in Supabase, so a single Arc invoice cannot be replayed into multiple dashboard rows.
- A `BEFORE UPDATE` trigger seals immutable columns (`creator_wallet`, `recipient_wallet`, `amount_usdc`, `memo`, `contract_link_id`, `created_at`).
- Anonymous clients cannot write `paid` or `cancelled`; server routes verify matching Arc `PaymentCompleted` or `PaymentLinkCancelled` events using `SUPABASE_SERVICE_ROLE_KEY`.
- Paid and cancelled rows are sealed after completion.
- Anonymous inserts are limited to payer-initiated permanent-profile requests. Unpaid profile requests are hidden from the creator dashboard until settlement is verified.

Profile handle claims and updates require a wallet signature matching the recipient wallet and are written only by the server route.

### Live QA proof

`npm run qa:live:direct` creates the matching contract link on Arc, proves anonymous standard invoice insertion is rejected, registers the invoice through live `/api/payments/create`, approves USDC from the funded QA payer, settles through `payLink`, calls the live Vercel reconciliation API, and reloads Supabase to prove the row became `paid`. `npm run qa:live:browser-wallet` repeats verified creation and direct settlement through the deployed React UI with separate RainbowKit-discovered EIP-1193 browser wallet contexts, capturing Arc tx hashes, screenshots, video, and paid persistence after refresh. `npm run qa:live:bridge-payment-ui` proves the deployed `Bridge & pay` interaction from funded Base Sepolia USDC through Circle App Kit CCTP and final Arc settlement. `npm run qa:live:profile-payment` proves a permanent handle can initiate and settle a real Arc payment. `npm run qa:live:walletconnect-payment` decodes the production QR, pairs an automated WalletKit peer, signs real Arc transactions through the WalletConnect protocol, and verifies the persisted receipt. `npm run qa:live:cancel` proves a forged anonymous cancellation is rejected, then signs `cancelLink` from the creator wallet and verifies the server-persisted cancelled checkout state. Failure-state and visual scripts cover recovery behavior and presentation quality. Reports are written under `docs/test-results/`.

WalletConnect production note: RainbowKit's QR component currently allows a `qr@0.6.0` version whose border validation breaks the wallet modal. `package.json` pins its nested `qr` dependency to compatible `0.5.5`; the live modal regression verifies the fix.

### Smart contract surface

```solidity
function createLink(bytes32 linkId, address recipient, uint256 amount, uint64 expiresAt) external;
function payLink(bytes32 linkId) external;          // approve USDC first
function payRecipient(bytes32 paymentId, address recipient, uint256 amount) external; // reusable profile payment
function cancelLink(bytes32 linkId) external;       // creator-only, unpaid-only
function getLink(bytes32 linkId) external view returns (PaymentLink memory);

event PaymentLinkCreated(bytes32 indexed linkId, address indexed creator, address indexed recipient, uint256 amount, uint64 expiresAt);
event PaymentCompleted(bytes32 indexed linkId, address indexed payer, address indexed recipient, uint256 grossAmount, uint256 feeAmount);
event PaymentLinkCancelled(bytes32 indexed linkId, address indexed creator);
```

Platform fee is capped at `100 bps` (1 %) in the constructor and `setFeeConfig`. Ownership is transferable. There is no `selfdestruct`, no proxy, no upgrade path — deploy once, immutable forever.

---

## Network reference

| | |
| --- | --- |
| Chain | Arc Testnet |
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | [`testnet.arcscan.app`](https://testnet.arcscan.app) |
| USDC ERC-20 | `0x3600000000000000000000000000000000000000` |
| Faucet | [`faucet.circle.com`](https://faucet.circle.com) |
| Native gas | USDC (yes, really) |

---

## Don't commit

`.env.local` · `DEPLOYER_PRIVATE_KEY` · `SUPABASE_SERVICE_ROLE_KEY` · `contracts/broadcast/` · `contracts/cache/` · `contracts/out/`

---

## License

[MIT](./LICENSE) © 2025 OneLink Collect contributors.
