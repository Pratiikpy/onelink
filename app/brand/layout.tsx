import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand",
  description:
    "OneLink brand & design system reference: logo, color, type and voice.",
  // Internal reference, not a marketing page — keep it out of search indexes.
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
