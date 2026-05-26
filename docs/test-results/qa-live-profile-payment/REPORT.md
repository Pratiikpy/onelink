# OneLink Live QA - Permanent Profile Payment

Generated: 2026-05-26T15:24:00.863Z
Profile URL: https://onelink-mauve-nu.vercel.app/qa-20260526152342
Status: green

## Flow Proven

| Step | Result | Evidence |
| --- | --- | --- |
| Open permanent handle | green | Live profile route loaded persisted freelancer recipient |
| Create payment request | green | Payer selected amount and memo through live UI |
| UI approval | green | [Arc approve](https://testnet.arcscan.app/tx/0x16e5edd13d707b606536717d97ae202eadef3ec8eaf9d1570a4be8266553c040) |
| Profile settlement | green | [Arc payRecipient](https://testnet.arcscan.app/tx/0xfd017a9849687a854d3d45bc6e558abed8da2f63069ed7c712073a69c42d1047) |
| Server reconciliation | green | Supabase persisted paid profile payment with matching transaction |
| Paid refresh and receipt | green | Paid UI survived reload and rendered verified receipt |

## Links

- Payment: https://onelink-mauve-nu.vercel.app/pay/qa-20260526152342-profile-payment-qa-0-02-p2qOc9
- Receipt: https://onelink-mauve-nu.vercel.app/receipt/985e30c5-9d0a-407c-bba5-30c64a11feb3

## Artifacts

- `payment-before-settlement.png`
- `payment-paid-after-refresh.png`
- `receipt.png`
- `videos/`
