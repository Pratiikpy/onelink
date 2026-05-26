import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PublicDocument } from "@/components/public-document";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Testnet terms and usage limits for OneLink Collect.",
};

export default function TermsPage() {
  return (
    <AppShell>
      <PublicDocument
        eyebrow="Terms of use"
        title="Testnet software, not a financial service."
        introduction="By using OneLink you acknowledge that this deployment is provided for product demonstration and testing with testnet assets only."
        sections={[
          {
            title: "Permitted use",
            bullets: [
              "Create and pay testnet USDC links for evaluation, testing, and demonstration.",
              "Use only supported testnet wallets and funded testnet balances.",
              "Verify completed results using the transaction link shown on each receipt.",
            ],
          },
          {
            title: "No real-money service",
            paragraphs: [
              "OneLink does not accept fiat payments, custody assets, provide investment services, or promise support for mainnet transactions. Testnet balances have no intended monetary value.",
            ],
          },
          {
            title: "Wallet responsibility",
            paragraphs: [
              "You control transaction approval in your connected wallet. Review every route, amount, recipient, and network before signing. Never provide a private key or recovery phrase to the application.",
            ],
          },
          {
            title: "Availability",
            paragraphs: [
              "Testnet RPCs, bridges, wallet connectors, and faucet balances can be interrupted or reset. The application is provided as-is for the demonstrated testnet scope.",
            ],
          },
        ]}
      />
    </AppShell>
  );
}
