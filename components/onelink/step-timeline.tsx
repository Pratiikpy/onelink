import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Step {
  key: string;
  label: string;
  detail?: string;
  hash?: string;
  status: "done" | "active" | "pending" | "failed";
}

export function StepTimeline({ steps }: { steps: Step[] }) {
  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-3 top-7 bottom-0 w-px",
                  s.status === "done" ? "bg-success" : "bg-hairline",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border",
                s.status === "done" && "border-success bg-success text-success-foreground",
                s.status === "active" && "border-foreground bg-background text-foreground",
                s.status === "pending" && "border-hairline bg-background text-muted-foreground",
                s.status === "failed" && "border-destructive bg-destructive/10 text-destructive",
              )}
            >
              {s.status === "done" && <Check className="h-3.5 w-3.5" />}
              {s.status === "active" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {s.status === "pending" && (
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              )}
              {s.status === "failed" && <span className="text-[10px]">!</span>}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-baseline justify-between gap-3">
                <p
                  className={cn(
                    "text-sm font-medium",
                    s.status === "pending" && "text-muted-foreground",
                  )}
                >
                  {s.label}
                </p>
                {s.status === "active" && (
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    in progress
                  </span>
                )}
              </div>
              {s.detail && <p className="mt-0.5 text-xs text-muted-foreground">{s.detail}</p>}
              {s.hash && (
                <p className="mt-1 font-mono text-[11px] text-muted-foreground/80 truncate">
                  {s.hash}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
