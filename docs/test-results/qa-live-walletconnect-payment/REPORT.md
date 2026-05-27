# OneLink Live QA - WalletConnect Signed Payment

Generated: 2026-05-26T15:24:32.240Z
Base URL: https://onelink-mauve-nu.vercel.app
Status: green

## Flow Proven

| Step | Result | Evidence |
| --- | --- | --- |
| Production QR decode and pairing | green | Live WalletConnect QR paired through WalletKit |
| Session proposal approval | green | Arc Testnet payer account approved in `eip155` namespace |
| Verified invoice creation | green | [Arc createLink](https://testnet.arcscan.app/tx/0x7a8aad7f31368f9078cd74f7d949af26a6f4b75d5ec00e4dd4794788df874613) accepted by live API |
| WalletConnect approval request | green | [Arc approve](https://testnet.arcscan.app/tx/0x8a7a5883eb2f987649dfb3ce68ab58843414fef3fad0a8355c22fbf1dd5f9e97) |
| WalletConnect payment request | green | [Arc payLink](https://testnet.arcscan.app/tx/0xc99f174e07c2329d0eb25e6aea4cde078d4812146452acb8c7b8c5d3cc038ae2) |
| Server reconciliation | green | Supabase persisted paid state with matching payment tx |
| Refresh and receipt | green | Paid state and verified receipt persisted after reload |

## Links

- Payment: https://onelink-mauve-nu.vercel.app/pay/walletconnect-qa-20260526152410
- Receipt: https://onelink-mauve-nu.vercel.app/receipt/6bd595fa-a022-4191-9920-096b552a1b30

## Artifacts

- docs/test-results/qa-live-walletconnect-payment/walletconnect-qr-modal.png
- docs/test-results/qa-live-walletconnect-payment/walletconnect-connected.png
- docs/test-results/qa-live-walletconnect-payment/walletconnect-paid-after-refresh.png
- docs/test-results/qa-live-walletconnect-payment/receipt.png

## Scope Note

- This validates the production QR/WalletConnect protocol session using an automated WalletKit peer with a funded Arc Testnet account.
- It verifies the same connection and signing protocol used by a compatible WalletConnect wallet, without claiming a specific mobile wallet application's UI was exercised.
