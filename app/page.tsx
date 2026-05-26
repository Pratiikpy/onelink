import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { LandingClient } from "@/components/landing-client";

export const metadata: Metadata = {
  title: "One link. Supported USDC. Settled on Arc.",
  description:
    "USDC payment links on Arc Testnet with direct settlement and cross-chain bridge support.",
};

export default function Home() {
  return (
    <AppShell>
      <LandingClient />
    </AppShell>
  );
}
