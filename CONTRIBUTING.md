# Contributing to OneLink Collect

Thanks for taking the time to contribute. This document covers what you need
to know to land a change cleanly.

## Quick start

```bash
git clone https://github.com/Pratiikpy/onelink.git
cd onelink
nvm use                              # picks up .nvmrc (Node 22)
npm install
cp .env.example .env.local
npm run dev
```

The app boots in demo mode by default — links live in `localStorage`,
"payments" emit a `0xDEM0…` synthetic tx hash. The header is amber-banded to
make this visually unmistakable.

## Workflow

1. **Fork & branch.** Name branches `feat/...`, `fix/...`, or `chore/...`.
2. **Run the verification suite before pushing:**
   ```bash
   npm run lint
   npm run typecheck
   npm run build
   forge test
   ```
   All four must be green. The same gates run in CI on every push and PR
   (`.github/workflows/ci.yml`).
3. **Commits.** Use plain, descriptive subject lines (`Cancel button uses
   custom modal` over `WIP`). No need for Conventional Commits unless you
   prefer them.
4. **Open a PR** against `main` with:
   - One-paragraph summary of *why* the change matters.
   - Screenshots for any visual change.
   - A "Test plan" checklist of what you verified.

## Code style

- **TypeScript everywhere** — `strict: true`, no `any` unless escaping a
  third-party type gap (please comment why).
- **Server Components by default**; mark client components with `'use client'`.
- **Tailwind utilities** for styling, no CSS modules / styled-components.
- **Pure modules in `lib/`** — keep components thin, push logic into helpers.
- **One `Card`, one `Button`** — reuse the primitives in `components/ui.tsx`
  before adding new ones.
- **Solidity** lives in `contracts/` and follows the layout in `foundry.toml`.

## Smart contract changes

Any change to `contracts/src/OneLinkCollect.sol`:

1. Must keep the existing tests green.
2. Must add tests for new code paths (positive + revert paths).
3. Must update the ABI in `lib/contracts.ts` to match.
4. Must update `supabase/schema.sql` if it introduces a new status value or
   immutable field.

If you change the storage layout, document the migration path.

## Areas we'd love help in

- **Auth.** The Supabase RLS layer is intentionally trigger-only. A clean
  Supabase Auth integration (creator-scoped policies) is the next big win.
- **Provider tests.** The Circle App Kit calls are dynamic-imported so TS
  doesn't catch every drift. End-to-end Playwright tests would help.
- **Receiver UX.** The dashboard is functional but plain. Better filters,
  CSV export, share-as-image receipts — all welcome.

## Security disclosures

Please **don't** open a public issue for security problems. See
[`SECURITY.md`](./SECURITY.md) for the disclosure process.
