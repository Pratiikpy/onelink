"use client";

import { useCallback, useState } from "react";

export function useCopy(resetMs = 1500) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetMs],
  );

  return { copied, copy };
}

export async function shareOrCopy(opts: { title: string; text?: string; url: string }) {
  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await navigator.share(opts);
      return "shared" as const;
    } catch {
      // user cancelled or share failed — fall through to copy
    }
  }
  try {
    await navigator.clipboard.writeText(opts.url);
    return "copied" as const;
  } catch {
    return "failed" as const;
  }
}
