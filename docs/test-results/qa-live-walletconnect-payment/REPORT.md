# OneLink Live QA - WalletConnect Signed Payment

Generated: 2026-05-27T07:15:54.703Z
Base URL: https://onelink-mauve-nu.vercel.app
Status: green

## Flow Proven

| Step | Result | Evidence |
| --- | --- | --- |
| Production QR decode and pairing | green | Live WalletConnect QR paired through WalletKit |
| Session proposal approval | green | Arc Testnet payer account approved in `eip155` namespace |
| Verified invoice creation | green | [Arc createLink](https://testnet.arcscan.app/tx/0xb155eff41250959d9f8988579b7e9a8b46db97369b212945a7281c8ed8ee99ba) accepted by live API |
| WalletConnect approval request | green | [Arc approve](https://testnet.arcscan.app/tx/0x88a1da38ae7e8afcb659e61b64d3046e52e07fc8e038fac0ac5fc2362e2bf466) |
| WalletConnect payment request | green | [Arc payLink](https://testnet.arcscan.app/tx/0x911565693a254c25aeb3bf87e2bf5e3ba5dec697f659cb898434536b1d40140b) |
| Server reconciliation | green | Supabase persisted paid state with matching payment tx |
| Refresh and receipt | green | Paid state and verified receipt persisted after reload |

## Links

- Payment: https://onelink-mauve-nu.vercel.app/pay/walletconnect-qa-20260527071521
- Receipt: https://onelink-mauve-nu.vercel.app/receipt/8af89e4d-5edd-4ac6-a45d-69754acf9fd6

## Artifacts

- docs/test-results/qa-live-walletconnect-payment/walletconnect-qr-modal.png
- docs/test-results/qa-live-walletconnect-payment/walletconnect-connected.png
- docs/test-results/qa-live-walletconnect-payment/walletconnect-paid-after-refresh.png
- docs/test-results/qa-live-walletconnect-payment/receipt.png
- docs/test-results/qa-live-walletconnect-payment/videos/

## Scope Note

- This validates the production QR/WalletConnect protocol session using an automated WalletKit peer with a funded Arc Testnet account.
- It verifies the same connection and signing protocol used by a compatible WalletConnect wallet, without claiming a specific mobile wallet application's UI was exercised.
