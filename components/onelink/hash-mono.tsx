"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

export function HashMono({
  value,
  display,
  className,
  copyable = true,
}: {
  value: string;
  display?: string;
  className?: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* no-op */
    }
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-xs", className)}>
      <span className="truncate">{display ?? value}</span>
      {copyable && (
        <button
          onClick={onCopy}
          aria-label="Copy"
          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
      )}
    </span>
  );
}
