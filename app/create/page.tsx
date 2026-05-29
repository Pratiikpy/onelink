import type { Metadata } from "next";
import { CreateLinkForm } from "@/components/create-link-form";

export const metadata: Metadata = {
  title: "Create",
  description: "Create a payment link for USDC on Arc Testnet.",
  alternates: { canonical: "/create" },
};

export default function CreatePage() {
  return <CreateLinkForm />;
}
