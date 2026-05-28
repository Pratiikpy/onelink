# Best Possible OneLink On Arc Testnet

Last updated: 2026-05-28

This is the buildable product version of OneLink. It avoids unproven claims and focuses on what can realistically be shipped, tested, and shown on Arc Testnet.

## Product Positioning

**OneLink is a professional USDC payment profile for freelancers.**

A freelancer shares one link. A client opens it, chooses a supported USDC route, pays, and receives a receipt verified on Arc Testnet.

Use this line:

> One link. Supported USDC routes. Verified on Arc.

Do not say:

- Any blockchain
- Mainnet ready
- Solana supported
- Gateway live
- Instant from every wallet

## Final Product Feel

OneLink should feel like:

```text
Linktree for freelancer payments
+ Stripe Checkout clarity
+ Arcscan proof
```

The product should be simple, premium, mobile-first, and trustworthy.

## Final Core Flow

```text
Freelancer creates profile
-> Client opens profile
-> Client enters amount or picks preset
-> Client reviews checkout
-> Client chooses Arc direct or Base Sepolia bridge
-> OneLink shows pre-flight checks
-> Client pays
-> Server verifies Arc settlement
-> Receipt shows Arc proof
-> Freelancer sees payment in dashboard
```

## Buildable Product Features

### 1. Freelancer Profile

Goal: make every freelancer page feel shareable and professional.

Must have:

- Custom handle
- Avatar or initials
- Display name
- Short bio/trust copy
- Payment amount presets
- Memo presets: invoice, retainer, milestone
- Copy profile button
- Share profile button
- Supported route explanation
- Gateway shown as locked / coming next

Success criteria:

- Looks good on 390px mobile.
- Looks credible enough to send to a real client.
- Client understands they are paying a real wallet without seeing raw technical clutter.

### 2. Checkout Page

Goal: make the payer confident before signing anything.

Must have:

- Amount
- Memo
- Recipient
- Expiry/status
- Route cards:
  - Pay on Arc
  - Bridge from Base Sepolia
  - Gateway unified balance - coming next
- Payment timeline:
  - Link created
  - Wallet connected
  - Route ready
  - Arc settlement verified
  - Receipt ready

Success criteria:

- Payer understands what will happen before connecting.
- Gateway is visible as future direction but not clickable as a live claim.
- Bridge route clearly says Base Sepolia is the proven path.

### 3. Arc Pre-Flight Checklist

Goal: make Arc feel useful, not hidden.

Before payment, show:

- Network: Arc Testnet
- Arc USDC balance
- Approval required
- Arc uses USDC for gas
- Receipt will be verified on Arcscan

If balance is low:

- Show missing amount.
- Show `Open Circle Faucet`.
- Explain that Arc Testnet uses USDC for gas and payment.

Success criteria:

- No payer gets stuck wondering why payment is disabled.
- Judges can clearly see why Arc improves the payment flow.

### 4. CCTP Bridge Progress

Goal: make Circle CCTP visible and trustworthy.

For the Base Sepolia bridge route, show:

- Approve USDC
- Burn on Base Sepolia
- Fetch Circle attestation
- Mint on Arc
- Settle invoice
- Receipt ready

If App Kit exposes step data, map real step states into the UI.

If not, show the same steps as expected progress while keeping the final paid state server-verified.

Success criteria:

- Bridge feels real, not like a black box.
- Failed bridge states explain what happened and what the user should do next.

### 5. Receipt Page

Goal: make the receipt the strongest proof artifact.

Must have:

- Paid status
- Amount
- Memo
- Receiver
- Payer
- Payment method
- Network: Arc Testnet
- Arcscan link
- Copy receipt
- Verification timeline
- Proof drawer

Proof drawer should show:

- Chain ID: `5042002`
- Contract address
- Transaction hash
- Payment method: `payLink` or `payRecipient`
- Server verified: yes
- Explorer link

Success criteria:

- Receipt is shareable.
- Receipt is understandable to non-technical clients.
- Technical judges can inspect proof quickly.

### 6. Dashboard

Goal: give freelancer a clean control room.

Must have:

- Total collected
- Paid count
- Unpaid count
- Cancelled count
- Link list
- Status pills
- Copy payment link
- Open receipt
- Cancel unpaid link

Nice to have:

- Search/filter by memo or status
- Recent activity
- Highlight latest paid payment

Success criteria:

- Freelancer can manage links without opening Supabase/GitHub/Arcscan.
- Cancellation state is clear and final.

### 7. Failure States

Goal: no ugly dead ends.

Must handle:

- Link not found
- Link expired
- Link cancelled
- Already paid
- Wrong chain
- Wallet rejected
- Insufficient Arc USDC
- Bridge failed
- Server verification failed

Copy style:

- Say what happened.
- Say whether funds moved.
- Say what to do next.

Example:

```text
Wallet request was rejected. Nothing moved. You can try again when ready.
```

## Arc-Specific Improvements

These are the best Arc Testnet improvements to ship.

### Show USDC Gas

Add clear copy:

```text
Arc uses USDC for gas. No ETH needed on Arc.
```

Put this on:

- Checkout pre-flight
- Security page
- Whitepaper
- Receipt proof drawer

### Show Arcscan Proof

Every paid receipt should make Arcscan easy to open.

Use:

```text
Verified on Arcscan
```

not:

```text
Trust us, paid
```

### Show Chain Details

In proof drawer:

```text
Network: Arc Testnet
Chain ID: 5042002
Settlement: OneLinkCollect
Token: USDC
```

### Keep Arc Testnet Honest

Always say testnet where needed.

Do not imply mainnet funds or production finance.

## Circle-Specific Improvements

### Keep CCTP As The Live Cross-Chain Route

Use Base Sepolia -> Arc as the proven route.

Do not claim every source chain until each has live proof.

### Gateway Remains Coming Next

Gateway is powerful, but only enable it after:

- funded Gateway deposit
- balance display
- Gateway spend
- Arc settlement
- receipt proof
- QA report

Until then:

```text
Gateway unified balance - coming next
```

## UI/UX Quality Bar

Every page must be:

- Mobile-first
- Premium black/lime brand
- No horizontal overflow
- No awkward copy
- No unstyled loading state
- No raw technical error in user-facing UI
- Clear primary action
- Clear proof after payment

Important pages:

- Landing
- Profile
- Checkout
- Receipt
- Dashboard
- Create link
- Security
- Whitepaper
- Pitch
- Notion working doc

## Best Demo Setup

Keep these ready:

- One freelancer profile link
- One unpaid checkout link
- One paid direct Arc receipt
- One paid bridge receipt
- One WalletConnect proof receipt
- One launch readiness doc

Demo path:

```text
Landing
-> Profile
-> Checkout
-> Route cards
-> Pre-flight checklist
-> Receipt proof
-> Dashboard
-> Launch readiness
```

## What Not To Build Now

Do not build these before the core product is perfect:

- Solana
- Mainnet
- Fiat/card payments
- Full Gateway checkout without proof
- Complex accounting
- Subscriptions
- Team accounts
- Large identity/reputation system
- ERC-8004 / ERC-8183 production flow

Those can be future roadmap items, not current product requirements.

## Final Build Order

### P0 - Finish Now

1. Arc pre-flight checklist
2. Faucet helper
3. CCTP bridge step timeline
4. Receipt proof drawer
5. Fresh screenshots and QA proof

### P1 - Next

1. Gateway deposit/balance/spend proof
2. More verified CCTP source chains
3. Better dashboard filtering
4. Download/share receipt image

### P2 - Later

1. Passkey freelancer onboarding
2. Receipt-as-portfolio
3. Client reviews/testimonials
4. Milestone invoices

## Final Success Criteria

OneLink is at its best Arc Testnet version when:

- Freelancer can share one clean profile.
- Client can understand payment route before connecting.
- Direct Arc payment works.
- Base Sepolia to Arc bridge works.
- Every final state is server verified.
- Receipt has Arcscan proof.
- Mobile UI looks premium.
- Docs and claims are honest.
- Live QA proves the flow.

## Final One-Liner

> OneLink gives freelancers one professional USDC payment profile, with supported payment routes and receipts verified on Arc Testnet.
