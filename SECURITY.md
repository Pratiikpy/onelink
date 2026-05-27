# Security Policy

## Supported

OneLink Collect targets **Arc Testnet** (chain id `5042002`). There is no
mainnet deployment of `OneLinkCollect.sol` at this time. Testnet USDC has no
monetary value, but we still take vulnerability reports seriously because the
codebase is intended for production use once mainnet support lands.

| Surface | Reports we want |
| --- | --- |
| `contracts/src/OneLinkCollect.sol` | Reentrancy, fee underflow, access-control bypass, integer issues, unbounded loops, malicious upgrades (note: contract is non-upgradeable). |
| Supabase schema (`supabase/schema.sql`) | Trigger bypass, RLS escapes, ways to mutate a sealed paid/cancelled row, denial of service via unbounded inserts. |
| Frontend (`components/`, `lib/`) | XSS, prototype pollution, key leakage in the bundle, ways to forge a "paid" status without an on-chain `payLink`. |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security findings.**

Use GitHub's private vulnerability reporting or open a private security advisory
with the maintainers. Include:

- A description of the vulnerability and the impacted surface.
- Reproduction steps or a proof-of-concept.
- Your name / handle for credit, if you'd like.

We will acknowledge receipt within **72 hours** and provide a remediation
timeline within **7 days**. For high-severity issues we will work with you on
a coordinated disclosure window before publishing the fix.

## Out of scope

- Issues that require physical access to a victim's wallet.
- Issues in upstream dependencies (`@circle-fin/*`, `wagmi`, `viem`,
  `next`, etc.) without a OneLink-specific exploitation path — please report
  those upstream.
- Spam-prevention concerns on Supabase writes — known limitation; see the
  "Security trade-offs" section in `README.md`.
- Reports against demo deployments (`onelink-mauve-nu.vercel.app` while
  `NEXT_PUBLIC_ALLOW_DEMO=true`).

## Acknowledgements

Thanks to everyone who reports security issues responsibly — once mainnet
ships, contributors who help find and fix vulnerabilities will be credited
here.
