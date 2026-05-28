# OneLink Live QA - Browser Wallet Full Flow

Generated: 2026-05-28T06:07:57.815Z
Base URL: https://onelink-mauve-nu.vercel.app
Status: green

## Flow Proven

| Step | Result | Evidence |
| --- | --- | --- |
| UI wallet discovery | green | EIP-6963 browser wallet connected through RainbowKit |
| UI create link | green | [Arc createLink](https://testnet.arcscan.app/tx/0xeea2a1c67dd0949992db55227650d39b12bcdca5ac1a23b005ad6ca6926ce8af) |
| Cross-context load | green | Payer browser loaded `browser-wallet-qa-20260528060729-0-02-P1Uan0` from Supabase |
| UI approval | green | [Arc approve](https://testnet.arcscan.app/tx/0x31ac963ad040ba48b253b98ad8eb5ca4ad1d13252486916f03d3802002fc9133) |
| UI settlement | green | [Arc payLink](https://testnet.arcscan.app/tx/0x02e5ba951ec59baeeddf687059240d0cea439a319c1732303bf8db49e608366c) |
| Server reconciliation | green | Supabase persisted `paid` with matching settlement tx |
| Paid refresh | green | Payer page remained paid after reload |
| Receipt | green | https://onelink-mauve-nu.vercel.app/receipt/5e122d17-4d70-4140-af1f-54dcbec3828a |

## Artifacts

- docs/test-results/qa-live-browser-wallet/creator-created-link.png
- docs/test-results/qa-live-browser-wallet/payer-before-payment.png
- docs/test-results/qa-live-browser-wallet/payer-paid-after-refresh.png
- docs/test-results/qa-live-browser-wallet/receipt.png
- docs/test-results/qa-live-browser-wallet/videos/

## Scope Note

- This is an actual live frontend transaction flow through RainbowKit and an EIP-1193 browser wallet harness.
- Keys remain in Node environment variables and are not injected into the browser page.
- It does not claim a WalletConnect mobile QR handshake or a third-party extension popup was automated.
