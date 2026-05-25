import { AppShell } from "@/components/app-shell";
import { PayLinkClient } from "@/components/pay-link-client";

export default async function PayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <AppShell>
      <PayLinkClient slug={slug} />
    </AppShell>
  );
}
