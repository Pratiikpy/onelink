import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PublicDocument } from "@/components/public-document";

export const metadata: Metadata = {
  title: "Security and Verification",
  description: "How OneLink verifies testnet USDC settlement and defines its supported route scope.",
};

export default function SecurityPage() {
  return (
    <AppShell>
      <PublicDocument
        eyebrow="Trust center"
        title="Verification before claims."
        introduction="OneLink is a real Arc Testnet payment product. Its public language is deliberately limited to routes and outcomes that have completed live settlement tests."
        sections={[
          {
            title: "What has been proven live",
            bullets: [
              "Direct USDC payment on Arc Testnet through the deployed checkout.",
              "WalletConnect QR pairing and signed Arc Testnet payment through a compatible WalletConnect peer.",
              "Permanent freelancer profile payment with a persisted receipt.",
              "Base Sepolia to Arc Testnet bridge checkout through Circle App Kit and CCTP.",
            ],
          },
          {
            title: "How payment state is protected",
            paragraphs: [
              "A standard invoice is registered in shared storage only after the server verifies its Arc PaymentLinkCreated event, payment terms, and URL-derived link identifier. A single on-chain invoice cannot be replayed into multiple dashboard rows.",
              "The browser cannot mark a Supabase-backed payment as paid or cancelled. Server routes verify the corresponding Arc settlement or creator-cancellation event before writing either final state.",
              "Receipts expose the Arcscan settlement transaction so a payer or recipient can independently inspect the on-chain result.",
            ],
          },
          {
            title: "Why USDC is the gas token on Arc",
            bullets: [
              "Arc Testnet uses USDC as native gas. A payer never needs ETH or any other token to settle a OneLink invoice.",
              "OneLink separates Arc's native USDC gas from the ERC-20 USDC payment balance, so fees and settlement amounts stay explicit.",
              "Sub-second deterministic finality on Arc means the receipt page reflects on-chain settlement almost as fast as the wallet confirms.",
              "Arcscan is the public source of truth. Every paid OneLink receipt links to the exact Arc transaction that moved the USDC.",
            ],
          },
          {
            title: "Scope and limitations",
            bullets: [
              "This deployment operates on testnets and uses testnet USDC only. It is not a mainnet payment service.",
              "Base Sepolia is the live-proven bridge source. Displayed beta sources are not represented as launch-proven routes.",
              "Circle Gateway unified-balance checkout is disabled until its funded flow is separately verified.",
              "OneLink does not support cards, fiat transfer, Solana, or automatic payment from arbitrary wallet funds.",
              "Profile checkout requests are payer initiated; unpaid profile requests are not shown in the creator dashboard until settlement is verified.",
            ],
          },
          {
            title: "User safety",
            bullets: [
              "Confirm the recipient, amount, network, and route in the checkout before signing.",
              "Do not send mainnet funds or production credentials to this testnet deployment.",
              "Use the linked Arcscan receipt as the source of truth for a completed testnet settlement.",
            ],
          },
        ]}
      />
    </AppShell>
  );
}
