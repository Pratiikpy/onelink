# OneLink Collect

USDC payment links with Arc Testnet settlement.

OneLink Collect is a mobile-first web app for creating and paying USDC collection links. Payment metadata is stored offchain, while final payment settlement can be recorded through a smart contract on Arc Testnet.

The app supports local demo mode by default. When `NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS` is configured, it uses the deployed Arc Testnet contract for payment-link creation and settlement.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- wagmi, RainbowKit, and viem
- Circle App Kit
- Foundry
- Supabase optional metadata storage

## Features

- Create USDC payment links with amount, recipient, memo, and optional expiry.
- Pay links directly on Arc Testnet using ERC-20 USDC.
- Bridge USDC to Arc Testnet through Circle App Kit integration points.
- Use a Unified Balance payment path when configured.
- View payment receipts with Arcscan transaction links.
- Track created links from a minimal receiver dashboard.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and configure the values needed for your environment:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS=
NEXT_PUBLIC_PLATFORM_FEE_BPS=0
NEXT_PUBLIC_KIT_KEY=

ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
DEPLOYER_PRIVATE_KEY=
```

The app works without Supabase or a deployed contract by using browser localStorage and demo settlement.

## Arc Testnet

- Chain ID: `5042002`
- RPC: `https://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`
- Faucet: `https://faucet.circle.com`
- USDC ERC-20: `0x3600000000000000000000000000000000000000`

## Deploy Contract

Install Foundry, fund the deployer with Arc Testnet USDC, and set:

```bash
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
DEPLOYER_PRIVATE_KEY=...
FEE_RECIPIENT=...
PLATFORM_FEE_BPS=0
```

Deploy:

```bash
forge script contracts/script/DeployOneLinkCollect.s.sol:DeployOneLinkCollect \
  --rpc-url arc_testnet \
  --broadcast
```

Set the deployed address in `.env.local`:

```bash
NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS=0x...
```

Do not commit private keys or production secrets.

## Supabase

Run `supabase/schema.sql` in Supabase SQL editor and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Verification

```bash
npm run lint
npm run typecheck
npm run build
forge test
```

`forge test` requires Foundry to be installed locally.
