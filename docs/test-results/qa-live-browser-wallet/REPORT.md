# OneLink Live QA - Browser Wallet Full Flow

Generated: 2026-05-26T15:45:27.469Z
Base URL: https://onelink-mauve-nu.vercel.app
Status: green

## Flow Proven

| Step | Result | Evidence |
| --- | --- | --- |
| UI wallet discovery | green | EIP-6963 browser wallet connected through RainbowKit |
| UI create link | green | [Arc createLink](https://testnet.arcscan.app/tx/0x31010fb359a647788a44d0219756e92f9cb618117ce4352c3fed128595521d44) |
| Cross-context load | green | Payer browser loaded `browser-wallet-qa-20260526154443-0-02-og0FX9` from Supabase |
| UI approval | green | [Arc approve](https://testnet.arcscan.app/tx/0x66a0190974dbd96424a0432e3250ec41ac1e75442f4fd3c24fde9b49b519db98) |
| UI settlement | green | [Arc payLink](https://testnet.arcscan.app/tx/0x6b921b06d601e88cf1cdb0ea1eb5237cd89dc7220c0ef2ab6b910f46b312c4ab) |
| Server reconciliation | green | Supabase persisted `paid` with matching settlement tx |
| Paid refresh | green | Payer page remained paid after reload |
| Receipt | green | https://onelink-mauve-nu.vercel.app/receipt/7e41bf18-b61c-4af2-baeb-b10f219d58e8 |

## Artifacts

- docs/test-results/qa-live-browser-wallet/creator-created-link.png
- docs/test-results/qa-live-browser-wallet/payer-before-payment.png
- docs/test-results/qa-live-browser-wallet/payer-paid-after-refresh.png
- docs/test-results/qa-live-browser-wallet/receipt.png

## Scope Note

- This is an actual live frontend transaction flow through RainbowKit and an EIP-1193 browser wallet harness.
- Keys remain in Node environment variables and are not injected into the browser page.
- It does not claim a WalletConnect mobile QR handshake or a third-party extension popup was automated.
