import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accent?: "primary" | "success" | "warning" | "info";
  className?: string;
}

const accentMap: Record<NonNullable<StatsCardProps["accent"]>, string> = {
  primary: "from-primary/15 to-primary/0 text-primary",
  success: "from-success/15 to-success/0 text-success",
  warning: "from-warning/20 to-warning/0 text-warning",
  info: "from-info/15 to-info/0 text-info",
};

export function StatsCard({
  label,
  value,
  hint,
  icon,
  accent = "primary",
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          accentMap[accent]
        )}
      />
      <CardContent className="relative flex items-start justify-between gap-3 p-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background/70 text-current shadow-sm ring-1 ring-border">
            {icon}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
