import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { CreateLinkForm } from "@/components/create-link-form";

export const metadata: Metadata = {
  title: "Create a USDC payment link",
  description:
    "Create a clean USDC payment link. Payers settle on Arc Testnet directly or bridge in from Base, Ethereum, or Arbitrum Sepolia via Circle App Kit.",
};

export default function Home() {
  return (
    <AppShell>
      <CreateLinkForm />
    </AppShell>
  );
}
