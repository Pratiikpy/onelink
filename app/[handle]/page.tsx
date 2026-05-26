import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { ProfilePayClient } from "@/components/profile-pay-client";

export const metadata: Metadata = {
  title: "Pay",
  description: "Pay a freelancer in USDC through an Arc-settled OneLink profile.",
};

export default async function ProfilePayPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return (
    <AppShell>
      <ProfilePayClient handle={handle} />
    </AppShell>
  );
}
