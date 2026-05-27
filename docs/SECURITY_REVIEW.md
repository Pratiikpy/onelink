# Dependency Security Review

Reviewed: 2026-05-27

## Resolution Summary

| Advisory path | Decision | Evidence |
| --- | --- | --- |
| Transitive `ws` below `8.20.1` through wallet-provider dependencies | Patched through an npm override to `^8.20.1`. | Clean install, lint, typecheck, build, contract tests, and live QA are required gates. |
| Transitive `uuid` below `11.1.1` through wallet-provider and Circle dependencies | Patched through an npm override to `^11.1.1`. | Same verification gates apply because wallet connectivity is runtime-critical. |
| `postcss@8.4.31` bundled through Next.js | Accepted upstream risk pending a supported Next.js fix. | `next@15.5.18` and current `next@16.2.6` both declare `postcss@8.4.31`; the affected CSS stringify path is not exposed to user-authored CSS in OneLink. |

## Verification Evidence

- Verified production deployment: `dpl_FYHUN3ihrwfCJvYQqeBzhM9MMErY`.
- `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`, and
  `npm run test:contracts` passed after the overrides.
- `npm run qa:live:visual` and `npm run qa:live:walletconnect-modal` passed on
  the deployed app.
- A fresh signed WalletConnect settlement passed on Arc Testnet:
  [payLink transaction](https://testnet.arcscan.app/tx/0x911565693a254c25aeb3bf87e2bf5e3ba5dec697f659cb898434536b1d40140b).
- CodeQL passed after dynamic payment and receipt route segments were URL-encoded;
  GitHub reports zero open code-scanning alerts.

## Policy

- No high or critical dependency alerts are accepted for submission.
- Moderate alerts must be patched or documented with a concrete exposure assessment.
- Security dependency changes must pass CI and, when wallet/settlement packages
  change, the applicable live QA flow before being represented as launch-ready.

## Enabled Repository Protections

- GitHub secret scanning and push protection.
- GitHub private vulnerability reporting.
- Dependabot security updates.
- CodeQL scanning for JavaScript/TypeScript.
