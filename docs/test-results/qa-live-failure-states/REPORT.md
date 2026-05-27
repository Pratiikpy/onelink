# OneLink Live QA - Failure States

Generated: 2026-05-26T15:20:06.422Z
Base URL: https://onelink-mauve-nu.vercel.app
Status: green

| Case | Result | Evidence |
| --- | --- | --- |
| Missing link | green | Rendered not-found state |
| Expired link | green | Rendered expired terminal state |
| Insufficient funds | green | Balance warning rendered and payment disabled |
| Rejected wallet action | green | Rejected signature rendered and persisted as failed |
| Invalid settlement proof | green | Server rejected a non-confirmed tx hash with HTTP 409 |
| QA cleanup | green | Temporary negative-state rows removed after capture |

## Artifacts

- `missing-link.png`
- `expired-link.png`
- `insufficient-funds.png`
- `rejected-wallet-action.png`

## Scope Note

- The rejection harness intentionally refuses `eth_sendTransaction`; it does not spend testnet funds.
- Failure-state fixtures are inserted with the server-only QA client because public standard invoice creation is Arc-event verified.
- The reconciliation rejection proves fake transaction hashes cannot mark a row paid.
- Temporary negative-state rows are removed after screenshots and assertions so the demo dashboard remains clean.
