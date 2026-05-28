import Link from "next/link";

import { cn } from "@/lib/utils";

type Size = 16 | 20 | 24 | 32 | 48 | 64 | 96;

/**
 * OneLink mark — two interlocking arcs forming a chain-link "O".
 * Monoline, currentColor, optically centered inside a soft squircle.
 */
export function LogoMark({
  size = 24,
  className,
  withFrame = true,
}: {
  size?: Size;
  className?: string;
  withFrame?: boolean;
}) {
  // Stroke compensates per size so the mark stays optically even.
  const stroke = size <= 16 ? 1.4 : size <= 24 ? 1.5 : size <= 32 ? 1.6 : 1.75;
  return (
    <span
      className={cn(
        "relative inline-grid place-items-center",
        withFrame && "rounded-[28%] bg-foreground text-background",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 32 32"
        width={Math.round(size * 0.7)}
        height={Math.round(size * 0.7)}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      >
        <path d="M19 9.5a7 7 0 0 0-9.9 0 7 7 0 0 0 0 9.9l2.2 2.2" />
        <path d="M13 22.5a7 7 0 0 0 9.9 0 7 7 0 0 0 0-9.9L20.7 10.4" />
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
