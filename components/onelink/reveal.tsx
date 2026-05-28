"use client";

import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";

import { cn } from "@/lib/utils";

/** Fade + 8px rise on first view. Calm, 480ms, ease-out-soft. */
export function Reveal({
  children,
  delay = 0,
  as: As = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Comp = As as ElementType;
  return (
    <Comp
      ref={ref as React.RefObject<HTMLElement>}
      style={{ animationDelay: shown && delay ? `${delay}ms` : undefined }}
      className={cn("reveal", shown && "is-in", className)}
    >
      {children}
    </Comp>
  );
}
