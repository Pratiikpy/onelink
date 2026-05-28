import type { Metadata } from "next";
import { ProfilePayClient } from "@/components/profile-pay-client";

export const metadata: Metadata = {
  title: "Profile",
  description: "Pay a freelancer in USDC through an Arc-settled OneLink profile.",
};

export default async function ProfilePayPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return <ProfilePayClient handle={handle} />;
}
