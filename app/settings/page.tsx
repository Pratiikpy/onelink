import type { Metadata } from "next";
import { SettingsClient } from "@/components/settings-client";

export const metadata: Metadata = {
  title: "Settings",
  description: "Network configuration and environment health for OneLink Collect.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
