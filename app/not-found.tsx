import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 text-snow">
      <section className="surface max-w-[720px] rounded-[34px] p-10 text-center">
      <div className="flex justify-center">
        <Logo />
      </div>
      <div>
        <p className="mono-label mt-10 text-[14px]">404</p>
        <h1 className="mt-4 text-[64px] font-medium leading-none tracking-[-0.04em] text-white">
          Nothing at this link
        </h1>
        <p className="mx-auto mt-5 max-w-[520px] text-[24px] leading-[1.35] text-white/55">
          Check the URL, or start a new OneLink collection.
        </p>
      </div>
      <Link
        href="/create"
        className="mt-8 inline-flex h-16 items-center justify-center rounded-[22px] bg-lime px-10 text-[22px] font-medium text-ink"
      >
        Create a link
      </Link>
      </section>
    </main>
  );
}
