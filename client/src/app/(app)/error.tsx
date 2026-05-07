"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/common/page-container";

export default function AppError({
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
    <PageContainer>
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Something broke</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message || "We hit an unexpected error loading this page."}
        </p>
        <Button onClick={reset} variant="default" className="mt-4">
          <RotateCcw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    </PageContainer>
  );
}
