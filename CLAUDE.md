# OneLink Collect — Claude Code Instructions

USDC payment links with Arc Testnet settlement. Mobile-first Next.js app that
creates and pays USDC collection links, settling on a deployed contract on Arc
Testnet (chain id `5042002`).

## Stack snapshot

- Next.js 15 App Router + React 19 + TypeScript
- Tailwind CSS
- `wagmi` + `viem` + RainbowKit for wallet/RPC
- `@circle-fin/app-kit` + `@circle-fin/adapter-viem-v2` for Circle flows
  (bridging, unified balance)
- Foundry for the Solidity contract under `contracts/`
- Supabase (optional) for offchain metadata; falls back to `localStorage`

Key constants (Arc Testnet):

- Chain id: `5042002`
- RPC: `https://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`
- USDC ERC-20: `0x3600000000000000000000000000000000000000`
- Faucet: `https://faucet.circle.com`

## Circle / Arc tooling installed in this repo

This project has **Circle's official skills** and **Arc + Circle MCP servers**
wired up. Use them instead of guessing Circle SDK APIs, Arc chain config, or
USDC contract details from memory — Circle's SDKs change frequently and your
training data may be stale.

### Circle skills (`.agents/skills/<name>/SKILL.md`)

Read the matching `SKILL.md` BEFORE writing code that touches the area it
covers. Treat the skill file as authoritative for that capability.

| Skill | Read when working on… |
| --- | --- |
| `use-arc` | Arc chain config, contract deployment (Foundry/Hardhat), viem/wagmi wiring for Arc, CCTP bridging into Arc |
| `use-usdc` | USDC balances, transfers, approvals, decimals/verification on EVM or Solana |
| `bridge-stablecoin` | CCTP UX, progress tracking, App Kit Bridge Kit integration |
| `use-gateway` | Circle Gateway unified balance, sub-500ms crosschain transfers |
| `unify-balance` | App Kit / Unified Balance Kit crosschain balance aggregation |
| `swap-tokens` | Same-chain swaps via App Kit / Swap Kit |
| `use-circle-wallets` | Choosing between developer-controlled / user-controlled / modular wallets |
| `use-developer-controlled-wallets` | Custodial wallets, payouts, treasury, automation |
| `use-user-controlled-wallets` | Embedded wallets with social login / OTP / PIN |
| `use-modular-wallets` | Passkey auth, gasless tx, ERC-4337 / ERC-6900 |
| `use-agent-wallet` | Email/OTP login, wallet creation, status, balances for agent wallets |
| `fund-agent-wallet` | Funding agent wallets via fiat on-ramp / crypto / Gateway |
| `agent-wallet-policy` | Per-tx, daily, weekly, monthly USDC spending caps |
| `pay-via-agent-wallet` | x402 paid-API payments (search, market data, weather, sports) |
| `use-circle-cli` | Circle's unified CLI for agent wallets, x402, crosschain transfers |
| `use-smart-contract-platform` | Deploying/calling contracts via Circle SCP, ERC-20/721/1155 templates |

Rule: when a task touches one of these areas, the FIRST action is to
`Read` the relevant `.agents/skills/<name>/SKILL.md`. Do not paraphrase Circle
APIs from prior knowledge.

### MCP servers (already connected)

- **`arc-docs`** (`https://docs.arc.io/mcp`) — read-only docs search/fetch for
  the Arc blockchain. Use for questions about Arc chain primitives, gas (USDC
  is native gas on Arc), supported standards, bridging, ecosystem tooling.
  Start with the `search` tool, then `get page` for the full doc.
- **`circle`** (`https://api.circle.com/v1/codegen/mcp`) — Circle's official
  code-generation endpoint for Wallets, Contracts, CCTP, Gateway. Use it when
  scaffolding new Circle-SDK code, or when the installed skill alone is not
  enough to answer a specific API/version question.

Routing rule:

1. If the question is conceptual or doc-shaped ("how does Arc do X", "what
   chains does CCTP support") → use **`arc-docs`** search first.
2. If the task is "write or fix code that calls a Circle product" → read the
   matching skill, then use **`circle`** MCP for codegen if the skill leaves
   gaps.
3. Only fall back to general web search / training knowledge if both fail.

### Reach-for-these triggers (do not skip)

The following user requests MUST kick off the workflow above before any code
is written:

- "add bridging" / "bridge USDC to Arc" → `bridge-stablecoin` + `use-arc`
- "let users pay with USDC" → `use-usdc` + (existing wagmi flow in `lib/`)
- "deploy the contract" / "redeploy `OneLinkCollect`" → `use-arc` (Foundry
  section) + verify against `foundry.toml` and `contracts/script/`
- "switch to gasless" / "passkey login" → `use-modular-wallets`
- "use the Circle App Kit unified balance" → `unify-balance` + `use-gateway`
- "agent pays for an API" / x402 → `pay-via-agent-wallet`
- Any "what's the right Circle wallet for…" question → `use-circle-wallets`
  decision matrix

## Project-specific guardrails

- This repo intentionally works in **demo mode** with `localStorage` when
  `NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS` and Supabase env vars are absent.
  Preserve that fallback — do not require Supabase or a deployed contract
  for the dev server to boot.
- Treat `.env.example` as the source of truth for required env keys. New
  Circle/Arc env vars must be added there too (without secret values).
- Arc Testnet USDC lives at `0x3600000000000000000000000000000000000000`. Do
  not hardcode mainnet USDC addresses anywhere in this app.
- Verification suite (run before declaring a task done):
  ```bash
  npm run lint
  npm run typecheck
  npm run build
  forge test   # requires Foundry locally
  ```
- Never commit `.env.local`, `DEPLOYER_PRIVATE_KEY`, or any value resembling
  a private key / API secret.

## Conventions

- Server components by default; mark client components with `'use client'`.
- Wallet/RPC code lives in `lib/`; UI in `components/` and `app/`.
- Solidity sources in `contracts/src`, tests in `contracts/test`, deploy
  scripts in `contracts/script` (per `foundry.toml`).
- Keep new Circle SDK calls behind small wrappers in `lib/` so the rest of
  the app does not import `@circle-fin/*` directly.
- When you have to use dynamic imports for App Kit (bundle-size reason), also
  add a static `import type { … } from "@circle-fin/app-kit"` so TS still
  checks call sites — this is the only thing that catches param-shape drift.

## Repo layout cheat sheet

```
app/
  layout.tsx               · global metadata (OG + Twitter cards) + viewport
  page.tsx                 · /            CreateLinkForm
  pay/[slug]/page.tsx      · /pay/:slug   PayLinkClient
  receipt/[id]/page.tsx    · /receipt/:id ReceiptClient
  dashboard/page.tsx       · /dashboard
  settings/page.tsx        · /settings    env-health panel lives here
  error.tsx                · global crash boundary
  not-found.tsx            · branded 404
  icon.tsx                 · generated PNG favicon
  apple-icon.tsx           · generated 180×180 PWA touch icon
  opengraph-image.tsx      · generated 1200×630 OG card for socials
  robots.ts                · pay/receipt URLs blocked from indexing
  sitemap.ts               · / + /settings
components/                · all client-side UI
  app-shell.tsx            · top nav + DEMO banner (gated by HAS_CONTRACT)
  create-link-form.tsx     · validates amount, expiry, checksums recipient
  pay-link-client.tsx      · pay/bridge/unified-balance + preflight checks
  payment-card.tsx         · QR + share + copy feedback
  receipt-client.tsx       · receipt + demo-tx awareness
  dashboard-client.tsx     · connect-wallet empty state + per-link copy UX
  settings-client.tsx      · env health panel + network values
lib/
  arc.ts                   · constants, explorerTx(), isDemoTxHash()
  contracts.ts             · ABI + prod safety gate (throws if no contract)
  payments.ts              · slug/contractLinkId helpers, status types
  share.ts                 · useCopy() + Web Share API + clipboard fallback
  storage.ts               · Supabase + localStorage abstraction
contracts/                 · Foundry project (forge test gates the build)
supabase/schema.sql        · table + RLS + immutability trigger
public/                    · icon.svg + PWA manifest pointing at /icon
```

## Hard rules (do not violate)

- Never reintroduce `maximumScale: 1` in viewport — WCAG zoom violation.
- Never bypass the prod-safety throw in `lib/contracts.ts` without setting
  `NEXT_PUBLIC_ALLOW_DEMO=true`; the gate exists to stop silent demo-mode
  deploys.
- Never widen the Supabase RLS policies in `supabase/schema.sql` without
  also tightening the immutability trigger — the two enforce the same
  invariant from opposite sides.
- Never commit `.env.local`, `DEPLOYER_PRIVATE_KEY`, or
  `SUPABASE_SERVICE_ROLE_KEY`. The README lists the full no-commit set.
