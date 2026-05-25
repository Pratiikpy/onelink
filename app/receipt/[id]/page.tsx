import { AppShell } from "@/components/app-shell";
import { ReceiptClient } from "@/components/receipt-client";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell>
      <ReceiptClient id={id} />
    </AppShell>
  );
}
