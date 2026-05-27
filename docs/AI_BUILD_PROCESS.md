# AI Build Process

OneLink was built with an AI-assisted engineering workflow. This document
summarizes the process without treating AI output as a substitute for product
verification.

## Operating Model

| Practice | How it was used |
| --- | --- |
| Goal-driven execution | Work was organized around launch-readiness goals instead of isolated prompts. |
| MCP-backed research | Circle and Supabase MCP tools were used to inspect current product docs and project state before implementation. |
| Local skills | Arc, Circle, Gateway, CCTP, USDC, wallet, and Supabase workflow skills guided implementation decisions. |
| Human-controlled secrets | Secrets remained in local environment or managed deployment settings, never in committed source. |
| Evidence-first QA | Claims were accepted only after tests, screenshots, transaction hashes, or deployment output existed. |

## Where AI Helped

- UI polish across landing, checkout, receipt, dashboard, whitepaper, and profile pages.
- Arc/Circle scope correction so the product does not overclaim unsupported chains.
- Live QA automation for WalletConnect, browser wallet, direct payment, bridge route, profile payment, cancellation, failure states, and responsive screenshots.
- Documentation packaging for judges: README, launch readiness, UI/UX audit, architecture, and whitepaper.
- GitHub hygiene: templates, CI, security policy, curated screenshots, and repo metadata.

## Verification Standard

The project does not treat a generated implementation as complete until it is
verified through the relevant gates:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:contracts
npm run qa:live:visual
```

Live transaction and visual proof lives in
[`LAUNCH_READINESS.md`](./LAUNCH_READINESS.md).
