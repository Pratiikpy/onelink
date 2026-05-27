import Link from "next/link";
import { ARC_EXPLORER_URL, ARC_FAUCET_URL } from "@/lib/arc";

const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/8 pb-8 pt-8 text-sm text-white/45 sm:mt-24">
      <div className="mx-auto flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium tracking-tight text-white">OneLink Collect</p>
          <p className="mt-1 text-xs font-medium text-white/40">
            Supported USDC routes, settled and verified on Arc Testnet.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-3 sm:flex sm:flex-wrap sm:justify-end sm:gap-6">
          <Link href="/create" className="font-medium text-white/65 transition hover:text-white">
            Create link
          </Link>
          <Link href="/security" className="font-medium text-white/65 transition hover:text-white">
            Security
          </Link>
          <Link href="/whitepaper" className="font-medium text-white/65 transition hover:text-white">
            Whitepaper
          </Link>
          <Link href="/privacy" className="font-medium text-white/65 transition hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="font-medium text-white/65 transition hover:text-white">
            Terms
          </Link>
          <a
            href={ARC_EXPLORER_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-white/65 transition hover:text-white"
          >
            Arcscan
          </a>
          <a
            href={ARC_FAUCET_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-white/65 transition hover:text-white"
          >
            Faucet
          </a>
          <a
            href="https://github.com/Pratiikpy/onelink"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-white/65 transition hover:text-white"
          >
            GitHub
          </a>
        </nav>
      </div>

      <div className="mx-auto mt-8 flex flex-col gap-2 border-t border-white/5 pt-6 text-[11px] font-semibold text-white/30 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} OneLink Collect. Open source under the MIT License.</p>
        <p>Testnet product · chain id 5042002 · no fiat payments</p>
      </div>
    </footer>
  );
}
