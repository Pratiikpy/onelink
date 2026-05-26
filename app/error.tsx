"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Logo } from "@/components/logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 text-snow">
      <section className="surface max-w-[720px] rounded-[34px] p-10 text-center">
      <div className="flex justify-center">
        <Logo />
      </div>
      <div>
        <p className="mono-label mt-10 text-[14px]">Route error</p>
        <h1 className="mt-4 text-[64px] font-medium leading-none tracking-[-0.04em] text-white">
          Something broke
        </h1>
        <p className="mx-auto mt-5 max-w-[520px] text-[24px] leading-[1.35] text-white/55">
          Retry the page. If it still fails, return home and create a fresh link.
        </p>
        {error.digest && (
          <p className="mt-6 break-all rounded-[22px] border border-white/8 bg-white/[0.03] p-3 font-mono text-[13px] text-white/45">
            Ref: {error.digest}
          </p>
        )}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3">
        <button
          onClick={reset}
          className="inline-flex h-16 items-center justify-center gap-2 rounded-[22px] bg-lime px-6 text-[22px] font-medium text-ink"
        >
          <RotateCcw className="size-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-16 items-center justify-center rounded-[22px] border border-white/12 bg-white/8 px-6 text-[22px] font-medium text-white"
        >
          Home
        </Link>
      </div>
      </section>
    </main>
  );
}
