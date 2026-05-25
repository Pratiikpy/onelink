import type { Metadata } from "next";
import { SettingsClient } from "@/components/settings-client";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Settings",
  description: "Network configuration and environment health for OneLink Collect.",
};

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsClient />
    </AppShell>
  );
}
