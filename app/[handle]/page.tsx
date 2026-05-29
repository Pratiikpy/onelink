import type { Metadata } from "next";
import { ProfilePayClient } from "@/components/profile-pay-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const clean = handle.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 32) || "profile";
  return {
    title: `@${clean} · Pay in USDC`,
    description: `Pay @${clean} in USDC through an Arc-settled OneLink profile.`,
    // User-generated profile pages should not be indexed by search engines.
    robots: { index: false, follow: false },
  };
}

export default async function ProfilePayPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return <ProfilePayClient handle={handle} />;
}
