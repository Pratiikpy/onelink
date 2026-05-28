import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/payments";

const map: Record<PaymentStatus, { label: string; cls: string; dot: string }> = {
  paid: {
    label: "Paid",
    cls: "bg-success/10 text-success border-success/20",
    dot: "bg-success",
  },
  unpaid: {
    label: "Unpaid",
    cls: "bg-foreground/[0.04] text-foreground border-hairline",
    dot: "bg-foreground/60",
  },
  processing: {
    label: "Processing",
    cls: "bg-warning/15 text-warning-foreground border-warning/30",
    dot: "bg-warning animate-pulse-dot",
  },
  expired: {
    label: "Expired",
    cls: "bg-muted text-muted-foreground border-hairline",
    dot: "bg-muted-foreground/60",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-muted text-muted-foreground border-hairline line-through decoration-muted-foreground/40",
    dot: "bg-muted-foreground/60",
  },
  failed: {
    label: "Failed",
    cls: "bg-destructive/10 text-destructive border-destructive/20",
    dot: "bg-destructive",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        s.cls,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
