# OneLink Collect — Agent Instructions

USDC payment links with Arc Testnet settlement. Mobile-first Next.js app that
creates and pays USDC collection links, settling on a deployed contract on Arc
Testnet (chain id `5042002`).

These instructions are the source of truth for any AI coding agent (Codex and
compatible agents read `AGENTS.md`) working in this repository.

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

## Circle / Arc tooling

This project relies on Circle's official **skills** and the **Arc + Circle MCP
servers**. Use them instead of guessing Circle SDK APIs, Arc chain config, or
USDC contract details from memory — Circle's SDKs change frequently and model
training data may be stale.

### Skills — read the matching skill BEFORE writing code in its area

| Skill | Read when working on… |
| --- | --- |
| `use-arc` | Arc chain config, contract deployment (Foundry/Hardhat), viem/wagmi wiring for Arc, CCTP bridging into Arc |
| `use-usdc` | USDC balances, transfers, approvals, decimals/verification |
| `bridge-stablecoin` | CCTP UX, progress tracking, App Kit Bridge Kit integration |
| `use-gateway` | Circle Gateway unified balance, crosschain transfers |
| `unify-balance` | App Kit / Unified Balance Kit crosschain balance aggregation |
| `use-circle-wallets` | Choosing between developer-/user-controlled / modular wallets |

Rule: when a task touches one of these areas, read the relevant skill first. Do
not paraphrase Circle APIs from prior knowledge.

### MCP servers

- **`arc-docs`** — read-only docs search/fetch for the Arc blockchain (chain
  primitives, gas — USDC is native gas on Arc — supported standards, bridging).
- **`circle`** — Circle's official code-generation endpoint for Wallets,
  Contracts, CCTP, and Gateway.

Routing: conceptual/doc questions → `arc-docs` search first; "write or fix code
that calls a Circle product" → read the matching skill, then `circle` MCP for
codegen. Fall back to general web search only if both fail.

## Project guardrails

- This repo intentionally works in **demo mode** with `localStorage` when
  `NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS` and Supabase env vars are absent.
  Preserve that fallback — do not require Supabase or a deployed contract for
  the dev server to boot.
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
- Never commit `.env.local`, `DEPLOYER_PRIVATE_KEY`, or any value resembling a
  private key / API secret.

## Conventions

- Server components by default; mark client components with `'use client'`.
- Wallet/RPC code lives in `lib/`; UI in `components/` and `app/`.
- Solidity sources in `contracts/src`, tests in `contracts/test`, deploy scripts
  in `contracts/script` (per `foundry.toml`).
- Keep new Circle SDK calls behind small wrappers in `lib/` so the rest of the
  app does not import `@circle-fin/*` directly.

## Repo layout cheat sheet

```
app/                · routes (/, /pay/[slug], /receipt/[id], /dashboard,
                      /settings, /create, /how-it-works, /whitepaper, /pitch)
components/         · client-side UI + design-system primitives (components/ui)
lib/                · arc.ts, contracts.ts, payments.ts, storage.ts, errors.ts,
                      rate-limit.ts, profiles.ts, share.ts
contracts/         · Foundry project (forge test gates the build)
supabase/schema.sql · table + RLS + immutability trigger
docs/              · launch readiness, audits, curated screenshots, QA results
```

## Hard rules (do not violate)

- Never reintroduce `maximumScale: 1` in viewport — WCAG zoom violation.
- Never bypass the prod-safety throw in `lib/contracts.ts` without setting
  `NEXT_PUBLIC_ALLOW_DEMO=true`; the gate stops silent demo-mode deploys.
- Never widen the Supabase RLS policies in `supabase/schema.sql` without also
  tightening the immutability trigger — the two enforce the same invariant.
- Gate every "server-verified / verified on Arcscan" claim on `HAS_CONTRACT`;
  in demo mode the UI must not promise on-chain verification it cannot deliver.
- Keep claim discipline: testnet-ready, mainnet not claimed, Gateway gated,
  Solana not implemented — consistently across app, README, and docs.
