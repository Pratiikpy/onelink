import { AppShell } from "@/components/app-shell";
import { CreateLinkForm } from "@/components/create-link-form";

export default function Home() {
  return (
    <AppShell>
      <CreateLinkForm />
    </AppShell>
  );
}
