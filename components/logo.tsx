import Link from "next/link";
import { clsx } from "clsx";

function RingMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={clsx("h-9 w-9", className)} aria-hidden>
      <circle
        cx="18"
        cy="18"
        r="13"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="66 16"
        transform="rotate(-40 18 18)"
      />
    </svg>
  );
}

export function Logo({
  compact = false,
  variant = "default",
}: {
  compact?: boolean;
  variant?: "default" | "pay";
}) {
  const isPay = variant === "pay";
  return (
    <Link
      href="/"
      className={clsx("inline-flex shrink-0 items-center", isPay ? "gap-1.5" : "gap-2 sm:gap-2.5")}
      aria-label="onelink home"
    >
      <RingMark
        className={clsx(
          "text-white",
          isPay ? "h-[18px] w-[18px]" : "h-8 w-8 sm:h-9 sm:w-9 xl:h-[30px] xl:w-[30px]",
        )}
      />
      {!compact && (
        <span
          className={clsx(
            "font-semibold leading-none tracking-tight",
            isPay ? "text-[15px]" : "text-[26px] sm:text-[34px] xl:text-[24px]",
          )}
        >
          onelink
        </span>
      )}
    </Link>
  );
}

export function RingIcon({ className }: { className?: string }) {
  return <RingMark className={className} />;
}
