# OneLink Live QA - Verified Creator Cancellation

Generated: 2026-05-26T15:44:15.470Z
Base URL: https://onelink-mauve-nu.vercel.app
Status: green

| Step | Result | Evidence |
| --- | --- | --- |
| Create unpaid invoice through UI | green | [Arc createLink](https://testnet.arcscan.app/tx/0xb8178553ce4b7524a238f191aefeabbee76900ea41332212f2ded57f5966df26) |
| Attempt anonymous cancellation write | green | Supabase RLS rejected forged `cancelled` update |
| Confirm cancellation from dashboard | green | `cancel-confirmation.png` |
| Sign creator cancellation on Arc | green | [Arc cancelLink](https://testnet.arcscan.app/tx/0x6508d42395374f9079fdbadff8bd7d02eeadd7c9a1e94185e4e8ab841febf1fc) |
| Server verify and persist cancelled state | green | `dashboard-cancelled.png` |
| Re-open checkout after cancellation | green | `checkout-cancelled.png` blocks payment |

- Payment: https://onelink-mauve-nu.vercel.app/pay/cancellation-qa-20260526154353-0-01-k-7LqR
