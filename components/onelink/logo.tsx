import Link from "next/link";

import { cn } from "@/lib/utils";

type Size = 16 | 20 | 24 | 32 | 40 | 48 | 64 | 96;

/**
 * OneLink mark — two interlocking arcs forming a chain-link "O".
 * Monoline, currentColor, optically centered inside a soft squircle.
 */
export function LogoMark({
  size = 24,
  className,
  withFrame = false,
}: {
  size?: Size;
  className?: string;
  withFrame?: boolean;
}) {
  // Open-ring mark — a single arc with an opening at the top, the OneLink "O".
  // currentColor stroke: inherits ink in the nav, flips to white on a brand frame.
  const inner = withFrame ? Math.round(size * 0.62) : size;
  return (
    <span
      className={cn(
        "relative inline-grid place-items-center",
        withFrame && "rounded-[28%] bg-brand text-white",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 100 100"
        width={inner}
        height={inner}
        fill="none"
        stroke="currentColor"
        strokeWidth={8.5}
        strokeLinecap="round"
      >
        <path d="M 74.4 20.9 A 38 38 0 1 1 25.6 20.9" />
      </svg>
    </span>
  );
}

/** Default horizontal lockup: mark + wordmark */
export function Logo({
  size = 24,
  className,
  href = "/",
  showWord = true,
  variant = "lockup",
}: {
  size?: Size;
  className?: string;
  href?: string;
  showWord?: boolean;
  variant?: "lockup" | "mark" | "stacked";
}) {
  const wordSize =
    size <= 20
      ? "text-[13px]"
      : size <= 24
      ? "text-[15px]"
      : size <= 32
      ? "text-[17px]"
      : "text-[22px]";

  if (variant === "stacked") {
    return (
      <Link href={href} className={cn("group inline-flex flex-col items-center gap-1.5", className)}>
        <LogoMark size={size} />
        {showWord && (
          <span className={cn("font-display font-semibold tracking-[-0.04em] lowercase", wordSize)}>
            onelink
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2 select-none", className)}
      aria-label="OneLink, home"
    >
      <LogoMark
        size={size}
        className="transition-transform duration-500 ease-out group-hover:rotate-[8deg]"
      />
      {showWord && variant === "lockup" && (
        <span
          className={cn(
            "font-display font-semibold tracking-[-0.04em] lowercase leading-none",
            wordSize,
          )}
        >
          onelink
        </span>
      )}
    </Link>
  );
}
