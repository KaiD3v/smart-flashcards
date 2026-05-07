"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            We hit an unexpected error. Try again, or head back to the
            dashboard.
          </p>
        </div>
        <div className="flex justify-center gap-2 pt-2">
          <Button onClick={reset} variant="default">
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
