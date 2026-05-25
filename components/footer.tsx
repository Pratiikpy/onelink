import Link from "next/link";
import { ARC_EXPLORER_URL, ARC_FAUCET_URL } from "@/lib/arc";

const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/8 pt-8 pb-8 text-sm text-white/45">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-black tracking-tight text-white">OneLink Collect</p>
          <p className="mt-1 text-xs font-medium text-white/40">
            Mobile-first USDC payment links · settled on Arc · powered by Circle.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-2 sm:flex sm:gap-6">
          <Link href="/" className="font-bold text-white/65 transition hover:text-white">
            Create
          </Link>
          <Link href="/dashboard" className="font-bold text-white/65 transition hover:text-white">
            Dashboard
          </Link>
          <Link href="/settings" className="font-bold text-white/65 transition hover:text-white">
            Settings
          </Link>
          <a
            href={ARC_EXPLORER_URL}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-white/65 transition hover:text-white"
          >
            Arcscan
          </a>
          <a
            href={ARC_FAUCET_URL}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-white/65 transition hover:text-white"
          >
            Faucet
          </a>
          <a
            href="https://github.com/Pratiikpy/onelink"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-white/65 transition hover:text-white"
          >
            GitHub
          </a>
        </nav>
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-2 border-t border-white/5 pt-6 text-[11px] font-semibold text-white/30 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} OneLink Collect. Open source under the MIT License.</p>
        <p>Arc Testnet · chain id 5042002 · USDC native gas</p>
      </div>
    </footer>
  );
}
