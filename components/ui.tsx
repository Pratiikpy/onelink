import { clsx } from "clsx";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={clsx("glass rounded-[28px] p-5 sm:p-6", className)}>{children}</div>;
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
      <span className="text-sm font-semibold text-white/72">{label}</span>
      {children}
      {hint && <span className="block text-xs text-white/42">{hint}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "h-14 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-base font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-violet/80 focus:ring-4 focus:ring-violet/15",
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
        "min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-base font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-violet/80 focus:ring-4 focus:ring-violet/15",
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
        "inline-flex h-14 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45",
        variant === "primary" && "bg-violet text-ink shadow-glow hover:bg-[#a59cff]",
        variant === "secondary" &&
          "border border-white/12 bg-white/8 text-white hover:border-violet/50 hover:bg-white/12",
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
        "inline-flex items-center gap-2 rounded-full border border-violet/25 bg-violet/10 px-3 py-1 text-xs font-bold text-violet",
        className,
      )}
    >
      {children}
    </span>
  );
}
