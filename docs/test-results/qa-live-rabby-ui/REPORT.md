# OneLink Live QA — Real Rabby Extension UI

Generated: 2026-05-29T22:20:55.225Z
Status: green

## What this proves

- The REAL Rabby browser extension (side-loaded, MV3 service worker) drove
  the production OneLink pay UI end to end as the payer.
- The payer key was imported through Rabby's own onboarding UI (not injected
  into the page); popups were confirmed via CDP-raw clicks on notification.html.

## Flow

- Invoice: [createLink](https://testnet.arcscan.app/tx/0x60ae7ec55158833affe94e551b61dcaeaa52d833ea1dd2ff232790d9493fb41a)
- Payment URL: https://onelink-mauve-nu.vercel.app/pay/rabby-ui-qa-20260529221905
- Paid (UI observed): true
- Paid (on-chain getLink): true
- Creator/recipient: `0x8fD0be3b709827535e1d690C17a7e51f577cEcdB`
- Payer (Rabby): `0xf6F0888C3FBF62aFeb4c1cC929fE1C782D09B00a`
