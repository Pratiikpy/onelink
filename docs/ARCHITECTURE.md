# OneLink Architecture

Last updated: 2026-05-27

OneLink is a testnet USDC payment-link product for freelancers. It creates
shareable payment links and permanent freelancer profile pages, then records
settlement only after the Arc Testnet contract emits verifiable on-chain
events.

## Product Boundary

| Capability | Status |
| --- | --- |
| Arc Testnet direct payment | Implemented and live-proven. |
| Base Sepolia to Arc route | Implemented through Circle App Kit / CCTP and live-proven. |
| Permanent freelancer profile | Implemented as `/{handle}` with payer-entered amount and memo. |
| Server-side reconciliation | Implemented for create, pay, cancel, and receipt state transitions. |
| Circle Gateway unified balance | Intentionally hidden until a funded deposit, burn, and mint flow is proven end to end. |
| Mainnet, fiat/card, Solana, arbitrary-chain checkout | Not claimed in this launch scope. |

## System Flow

```text
Creator wallet
  -> creates link or profile-backed payment request
  -> signs Arc transaction when registering/cancelling specific invoices
  -> API verifies Arc event before persisting trusted state

Payer wallet
  -> opens /pay/:slug or /:handle
  -> pays directly on Arc, or uses the proven Base Sepolia -> Arc route
  -> API verifies settlement before status changes to paid

Receipt
  -> reads persisted payment state
  -> displays Arcscan transaction as the source of truth
```

## Trust Boundaries

| Boundary | Rule |
| --- | --- |
| Browser | Can request actions, but cannot mark settlement complete by itself. |
| API routes | Verify transaction receipts and contract logs before mutating trusted state. |
| Supabase | Stores public payment metadata and enforces immutable terminal states. |
| Arc contract | Source of truth for registered links, paid links, and cancellation events. |
| Circle bridge route | Moves USDC into the Arc settlement path; checkout language is limited to proven routes. |

## Data Model

`payment_links` stores the public invoice and receipt state:

- `slug`: shareable URL id.
- `creator_wallet` and `recipient_wallet`: wallet-owned payout identity.
- `amount_usdc`, `memo`, `expires_at`: payer-facing invoice terms.
- `status`: `unpaid`, `paid`, `cancelled`, or expired by read-time validation.
- `tx_hash`, `paid_at`, `cancelled_at`: verified on-chain proof fields.
- `contract_link_id`: deterministic id used by `OneLinkCollect.sol`.
- `settlement_mode`: direct, bridge, WalletConnect, profile, or QA-specific route label.

## Verification Strategy

| Layer | Gate |
| --- | --- |
| TypeScript | `npm run typecheck` |
| UI lint | `npm run lint` |
| Production build | `npm run build` |
| Solidity | `npm run test:contracts` |
| Live visual QA | `npm run qa:live:visual` |
| Live route QA | `qa:live:*` scripts under `scripts/` |

Live evidence is summarized in [`LAUNCH_READINESS.md`](./LAUNCH_READINESS.md).

## Why Arc and Circle

Arc gives the product a USDC-native settlement environment with predictable
fees and fast finality. Circle App Kit and CCTP provide the bridge path used
for the current cross-chain testnet route. Gateway is documented as a future
upgrade, but the checkout does not expose it until the full funded flow is
proven.
