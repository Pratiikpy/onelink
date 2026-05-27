# OneLink Live QA - WalletConnect Modal

Generated: 2026-05-27T06:52:55.153Z
Base URL: https://onelink-mauve-nu.vercel.app
Status: green

| Case | Result | Evidence |
| --- | --- | --- |
| Open RainbowKit wallet picker | green | WalletConnect connector is available |
| Open WalletConnect connection path | green | Modal renders without client exception |
| Mobile screenshot | green | `walletconnect-modal-mobile.png` |

## Scope Note

- This proves production QR-modal rendering and connector availability after the dependency compatibility pin.
- Signed WalletConnect payment execution is covered separately by `qa:live:walletconnect-payment`.
