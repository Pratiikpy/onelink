# OneLink Live QA - Permanent Profile Payment

Generated: 2026-05-27T07:17:02.897Z
Profile URL: https://onelink-mauve-nu.vercel.app/qa-20260527071615
Status: green

## Flow Proven

| Step | Result | Evidence |
| --- | --- | --- |
| Open permanent handle | green | Live profile route loaded persisted freelancer recipient |
| Create payment request | green | Payer selected amount and memo through live UI |
| UI approval | green | [Arc approve](https://testnet.arcscan.app/tx/0x0ac40ec22f3bfc083ce63fa6deb17f88fe44136d9663e0ccba54d09083f46434) |
| Profile settlement | green | [Arc payRecipient](https://testnet.arcscan.app/tx/0x710dab9607e10bff1ed14ec28cc08a39b63a37ffddb22d9517c9ef65c7bc8d43) |
| Server reconciliation | green | Supabase persisted paid profile payment with matching transaction |
| Paid refresh and receipt | green | Paid UI survived reload and rendered verified receipt |

## Links

- Payment: https://onelink-mauve-nu.vercel.app/pay/qa-20260527071615-profile-payment-qa-0-02-wVjYm_
- Receipt: https://onelink-mauve-nu.vercel.app/receipt/9b9d87fd-5d79-4499-be6d-d371555828a7

## Artifacts

- `payment-before-settlement.png`
- `payment-paid-after-refresh.png`
- `receipt.png`
- `videos/`
