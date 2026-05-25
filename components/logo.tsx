import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="OneLink Collect home">
      <span className="grid size-9 place-items-center rounded-[10px] border border-violet/40 bg-violet/10">
        <span className="relative block size-5">
          <span className="absolute left-0 top-1 h-3 w-3 rounded-[5px] border-2 border-violet" />
          <span className="absolute bottom-1 right-0 h-3 w-3 rounded-[5px] border-2 border-violet" />
          <span className="absolute left-[7px] top-[7px] h-1.5 w-2.5 rounded-full bg-violet" />
        </span>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-lg font-semibold tracking-normal text-white">OneLink</span>
          <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-violet">
            Collect
          </span>
        </span>
      )}
    </Link>
  );
}
