import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { CreateLinkForm } from "@/components/create-link-form";

export const metadata: Metadata = {
  title: "Create",
  description: "Create a payment link for USDC on Arc Testnet.",
};

export default function CreatePage() {
  return (
    <AppShell>
      <CreateLinkForm />
    </AppShell>
  );
}
