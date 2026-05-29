import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Error 404
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This route doesn&apos;t exist on OneLink. The link may have moved or
          never existed.
        </p>
        <div className="mt-8 flex justify-center gap-2">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
