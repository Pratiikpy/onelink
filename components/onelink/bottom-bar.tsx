import { cn } from "@/lib/utils";

/**
 * Mobile-only sticky bottom action bar with hairline top border and
 * safe-area inset padding. Hidden on md+ where inline CTAs suffice.
 */
export function BottomBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-background/85 backdrop-blur-xl md:hidden",
        className,
      )}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
    >
      <div className="mx-auto flex max-w-md items-center gap-3 px-5 pt-3">{children}</div>
    </div>
  );
}
