"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function DemoBanner() {
  const params = useSearchParams();
  if (params?.get("state") !== "demo") return null;
  return (
    <div className="border-b border-hairline bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-2 text-xs">
        <p className="font-mono tracking-wide">
          DEMO MODE · No real settlement · Receipts use{" "}
          <span className="opacity-70">0xDEM0…</span>
        </p>
        <Link href="/" className="underline-offset-4 hover:underline">
          Exit demo
        </Link>
      </div>
    </div>
  );
}
