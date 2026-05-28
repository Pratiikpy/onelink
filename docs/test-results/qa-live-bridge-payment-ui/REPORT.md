# OneLink Live QA - Browser Bridge Payment Flow

Generated: 2026-05-28T06:09:01.878Z
Base URL: https://onelink-mauve-nu.vercel.app
Status: green

## Flow Proven

| Step | Result | Evidence |
| --- | --- | --- |
| Verified invoice prepared on Arc | green | [createLink](https://testnet.arcscan.app/tx/0x2fb14c650f08b7b1c597ca73d34146479df4ee9993c362f0f5d6e477d13a298b) accepted by live API |
| Live UI selected Bridge route | green | docs/test-results/qa-live-bridge-payment-ui/bridge-route-selected.png |
| Base USDC approval | green | [0x5e102b06...](https://sepolia.basescan.org/tx/0x5e102b063bca052d180930a8eee54e9ee08c5ea3918f66c6a378756f2eecdd67) |
| Base CCTP burn | green | [0xcc8c6dd5...](https://sepolia.basescan.org/tx/0xcc8c6dd560d307676286f530d0022618057875e09044ab060b7b286824d16955) |
| Arc CCTP mint | green | [0xab3c28d8...](https://testnet.arcscan.app/tx/0xab3c28d84f87c6f84174af1cf237d8eb7d3325372689d6fc746f73c5bb666cc9) |
| Arc USDC approval | green | [0x2421d5e0...](https://testnet.arcscan.app/tx/0x2421d5e01f83023f7ca7393d53a1253cc23c11a0f1ff470ba1b2b971fd5fc9de) |
| Arc invoice settlement | green | [0x4d462fb2...](https://testnet.arcscan.app/tx/0x4d462fb27219863c7d773657f1cdfab84fe7b05cefccc11afdc0c0ba8f03af3b) |
| Server reconciliation and refresh | green | Persisted paid receipt after UI bridge route |

- Payment: https://onelink-mauve-nu.vercel.app/pay/bridge-ui-qa-20260528060818
- Receipt: https://onelink-mauve-nu.vercel.app/receipt/66a322d0-89b2-4e82-a15e-607a4a424764

## Scope Note

- This uses the deployed payment UI and a browser wallet provider boundary; Circle App Kit performs Base Sepolia to Arc CCTP before Arc settlement.
