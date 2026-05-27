# OneLink Live QA - WalletConnect Signed Payment

Generated: 2026-05-27T06:54:18.533Z
Base URL: https://onelink-mauve-nu.vercel.app
Status: green

## Flow Proven

| Step | Result | Evidence |
| --- | --- | --- |
| Production QR decode and pairing | green | Live WalletConnect QR paired through WalletKit |
| Session proposal approval | green | Arc Testnet payer account approved in `eip155` namespace |
| Verified invoice creation | green | [Arc createLink](https://testnet.arcscan.app/tx/0xd38670ad707c4243719a04dec90de35db7f37e3338024a49251652a55060aea5) accepted by live API |
| WalletConnect approval request | green | [Arc approve](https://testnet.arcscan.app/tx/0x7c01d34026a13d7c75618364f5f92eea7260e49cbf45649ebc76f67f88658d7f) |
| WalletConnect payment request | green | [Arc payLink](https://testnet.arcscan.app/tx/0xe6ca95231e6bd7da97749397ee18c2d80385d7b64c1ff68a6de8020406931623) |
| Server reconciliation | green | Supabase persisted paid state with matching payment tx |
| Refresh and receipt | green | Paid state and verified receipt persisted after reload |

## Links

- Payment: https://onelink-mauve-nu.vercel.app/pay/walletconnect-qa-20260527065354
- Receipt: https://onelink-mauve-nu.vercel.app/receipt/02f355a9-3329-40c7-b26f-21e93b6a190c

## Artifacts

- docs/test-results/qa-live-walletconnect-payment/walletconnect-qr-modal.png
- docs/test-results/qa-live-walletconnect-payment/walletconnect-connected.png
- docs/test-results/qa-live-walletconnect-payment/walletconnect-paid-after-refresh.png
- docs/test-results/qa-live-walletconnect-payment/receipt.png
- docs/test-results/qa-live-walletconnect-payment/videos/

## Scope Note

- This validates the production QR/WalletConnect protocol session using an automated WalletKit peer with a funded Arc Testnet account.
- It verifies the same connection and signing protocol used by a compatible WalletConnect wallet, without claiming a specific mobile wallet application's UI was exercised.
