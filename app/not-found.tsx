import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="grid size-16 place-items-center rounded-2xl border border-violet/30 bg-violet/10">
        <Compass className="size-8 text-violet" />
      </div>
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-violet">404</p>
        <h1 className="mt-2 text-3xl font-black text-white">Nothing at this link</h1>
        <p className="mt-2 text-white/55">
          The page or payment link you tried to open doesn&apos;t exist. Check the URL, or start a
          new collection.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet px-6 text-sm font-bold text-ink shadow-glow"
      >
        <Home className="size-4" />
        Back to home
      </Link>
    </main>
  );
}
