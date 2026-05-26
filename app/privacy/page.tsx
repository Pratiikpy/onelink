import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PublicDocument } from "@/components/public-document";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy information for the OneLink Arc Testnet payment-link application.",
};

export default function PrivacyPage() {
  return (
    <AppShell>
      <PublicDocument
        eyebrow="Privacy"
        title="Public payment links require deliberate sharing."
        introduction="OneLink is a testnet demonstration product. Payment links and blockchain transactions are not private records; use only information appropriate for public verification."
        sections={[
          {
            title: "Information stored",
            bullets: [
              "Payment link details including recipient wallet, amount, memo, status, settlement route, and timestamps.",
              "Permanent profile handle and its associated recipient wallet when a creator claims a handle.",
              "Settlement transaction hashes used to render and verify paid receipts.",
            ],
          },
          {
            title: "Public blockchain information",
            paragraphs: [
              "Wallet addresses and completed Arc Testnet transaction activity are visible through public blockchain explorers. A memo included in a shared payment link should not contain confidential client or invoice information.",
            ],
          },
          {
            title: "Wallet connection",
            paragraphs: [
              "Wallet connection allows you to request or approve testnet transactions. OneLink never asks for a seed phrase or private key and does not custody user wallets.",
            ],
          },
          {
            title: "Testnet-only product",
            paragraphs: [
              "This application is built for hackathon demonstration and technical validation on supported testnets. Do not rely on it for production financial records or submit sensitive personal information.",
            ],
          },
        ]}
      />
    </AppShell>
  );
}
