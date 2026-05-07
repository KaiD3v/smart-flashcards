import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}
