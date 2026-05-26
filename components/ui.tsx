import { clsx } from "clsx";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={clsx("surface rounded-[34px] p-6 sm:p-7", className)}>{children}</div>;
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-white/66">{label}</span>
      {children}
      {hint && <span className="block text-xs text-white/45">{hint}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "h-16 w-full rounded-[24px] border border-white/10 bg-[#1A1A1E] px-6 text-xl font-medium text-snow outline-none transition placeholder:text-white/24 focus:border-lime/55",
        props.className,
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "min-h-24 w-full resize-none rounded-[24px] border border-white/10 bg-[#1A1A1E] px-6 py-4 text-xl font-medium text-snow outline-none transition placeholder:text-white/24 focus:border-lime/55",
        props.className,
      )}
    />
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex h-14 items-center justify-center gap-2 rounded-[22px] px-6 text-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
        variant === "primary" && "bg-lime text-ink shadow-glow hover:bg-[#d9fa7b]",
        variant === "secondary" &&
          "border border-white/12 bg-white/7 text-white hover:border-white/22 hover:bg-white/10",
        variant === "ghost" && "text-white/70 hover:bg-white/8 hover:text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-1.5 text-sm font-medium text-white/82",
        className,
      )}
    >
      {children}
    </span>
  );
}
