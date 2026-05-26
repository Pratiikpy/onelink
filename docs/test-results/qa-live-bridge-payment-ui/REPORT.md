# OneLink Live QA - Browser Bridge Payment Flow

Generated: 2026-05-26T15:30:17.671Z
Base URL: https://onelink-mauve-nu.vercel.app
Status: green

## Flow Proven

| Step | Result | Evidence |
| --- | --- | --- |
| Verified invoice prepared on Arc | green | [createLink](https://testnet.arcscan.app/tx/0x8e73b5abf2277a3104603c78137cbda58a172cb80540e6e48dfd79305a08ae48) accepted by live API |
| Live UI selected Bridge route | green | C:/Users/prate/onelink/docs/test-results/qa-live-bridge-payment-ui/bridge-route-selected.png |
| Base USDC approval | green | [0x27d13cda...](https://sepolia.basescan.org/tx/0x27d13cda517743534fe8c455ae9f5805d9ebb8fae6ff1154b459ffed343c8e46) |
| Base CCTP burn | green | [0x051298e4...](https://sepolia.basescan.org/tx/0x051298e44c02b47ddc99b708bd3060c9287bba6cc130444219b3197b7630a9db) |
| Arc CCTP mint | green | [0x76312604...](https://testnet.arcscan.app/tx/0x7631260432ac0e65428f7286bae6ee1b3a2e6a5c2e86079154027ced0e97f79d) |
| Arc USDC approval | green | [0xc691611d...](https://testnet.arcscan.app/tx/0xc691611d560a299107443cac76d6165c451428200ffda81b116e766b45c120bb) |
| Arc invoice settlement | green | [0xc5ac72e5...](https://testnet.arcscan.app/tx/0xc5ac72e58a77fd48c9f6781031557fbd63cc6c7556876f25b1bb218aea240ee3) |
| Server reconciliation and refresh | green | Persisted paid receipt after UI bridge route |

- Payment: https://onelink-mauve-nu.vercel.app/pay/bridge-ui-qa-20260526152945
- Receipt: https://onelink-mauve-nu.vercel.app/receipt/03648af0-6f4d-4ccd-930f-5feb527f5999

## Scope Note

- This uses the deployed payment UI and a browser wallet provider boundary; Circle App Kit performs Base Sepolia to Arc CCTP before Arc settlement.
