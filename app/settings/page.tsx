import type { Metadata } from "next";
import { SettingsClient } from "@/components/settings-client";

export const metadata: Metadata = {
  title: "Settings",
  description: "Network configuration and environment health for OneLink Collect.",
  // Utility page — robots.txt disallows /settings, so keep the meta in sync.
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return <SettingsClient />;
}
