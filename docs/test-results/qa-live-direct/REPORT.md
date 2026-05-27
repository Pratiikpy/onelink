# OneLink Live QA — Arc Direct Payment

Generated: 2026-05-26T15:20:29.081Z
Base URL: https://onelink-mauve-nu.vercel.app
Status: green

## Flow Proven

| Check | Result | Evidence |
| --- | --- | --- |
| Forged invoice insertion | green | Anonymous standard invoice row rejected by RLS |
| Creator contract link | green | [createLink](https://testnet.arcscan.app/tx/0x2b9656b38a109c41ca3555c8a42bd58096d8354801b6029de4db222f0dab10b7) |
| Verified shared invoice | green | Live `/api/payments/create` verified and registered `qa-live-20260526152021` |
| Payer USDC approval | green | [approve](https://testnet.arcscan.app/tx/0x27c9fbd806de327d74422d805fc31372569ec314ef46bc9daf4405e52deda2f3) |
| Arc settlement | green | [payLink](https://testnet.arcscan.app/tx/0x54117d84667f38bf4c05ead3d7baba5e18d1adcb1243ef25b4a223d2c54ba72e) |
| Server reconciliation | green | Live `/api/payments/reconcile` accepted tx and wrote `paid` |
| Persistence after reload | green | Supabase row reloaded with status `paid` |

## Wallets

- Creator/recipient: `0x8fD0...EcdB`
- Payer: `0xf6F0888C3FBF62aFeb4c1cC929fE1C782D09B00a`
- Amount: `0.25 USDC`

## Links

- Payment URL: https://onelink-mauve-nu.vercel.app/pay/qa-live-20260526152021
- Receipt URL: https://onelink-mauve-nu.vercel.app/receipt/c1ee1418-21a2-40bc-8ecd-bd51d3999267
- Arcscan settlement: https://testnet.arcscan.app/tx/0x54117d84667f38bf4c05ead3d7baba5e18d1adcb1243ef25b4a223d2c54ba72e

## Truth Notes

- This proves the direct Arc route with real Arc Testnet transactions.
- It does not prove the Base Sepolia bridge route or Gateway route.
- It is transaction-level live QA, not visual Rabby browser automation.
