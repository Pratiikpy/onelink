"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[onelink] route crash", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="grid size-16 place-items-center rounded-2xl border border-red-300/30 bg-red-300/10">
        <AlertTriangle className="size-8 text-red-200" />
      </div>
      <div>
        <h1 className="text-3xl font-black text-white">Something broke</h1>
        <p className="mt-2 text-white/55">
          The page hit an unexpected error. You can retry below, or head home and try again from the
          start.
        </p>
        {error.digest && (
          <p className="mt-3 break-all rounded-2xl border border-white/8 bg-white/[0.03] p-2 text-xs font-bold text-white/55">
            Ref: {error.digest}
          </p>
        )}
      </div>
      <div className="grid w-full grid-cols-2 gap-3">
        <button
          onClick={reset}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet text-sm font-bold text-ink shadow-glow"
        >
          <RotateCcw className="size-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/8 text-sm font-bold text-white"
        >
          <Home className="size-4" />
          Home
        </Link>
      </div>
    </main>
  );
}
