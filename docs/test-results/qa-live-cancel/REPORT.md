# OneLink Live QA - Verified Creator Cancellation

Generated: 2026-05-27T03:41:55.825Z
Base URL: https://onelink-mauve-nu.vercel.app
Status: green

| Step | Result | Evidence |
| --- | --- | --- |
| Create unpaid invoice through UI | green | [Arc createLink](https://testnet.arcscan.app/tx/0x35a8402fc2616e1f2b4e2a4e987e8e3460410dd0c749cacbc6716cf240731c6e) |
| Attempt anonymous cancellation write | green | Supabase RLS rejected forged `cancelled` update |
| Confirm cancellation from dashboard | green | `cancel-confirmation.png` |
| Sign creator cancellation on Arc | green | [Arc cancelLink](https://testnet.arcscan.app/tx/0xc58efdfd79cc19b1ceea3e80282640e86dcc64d31e9612a84a61b0880c2cd810) |
| Server verify and persist cancelled state | green | `dashboard-cancelled.png` |
| Re-open checkout after cancellation | green | `checkout-cancelled.png` blocks payment |

- Payment: https://onelink-mauve-nu.vercel.app/pay/cancellation-qa-20260527034131-0-01-v5tV6q
