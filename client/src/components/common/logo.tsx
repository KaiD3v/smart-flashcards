import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";

export function Logo({
  href = "/",
  showWordmark = true,
  className,
}: {
  href?: string;
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 font-semibold tracking-tight",
        className
      )}
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-[linear-gradient(135deg,oklch(0.55_0.21_280),oklch(0.62_0.22_330))] text-white shadow-md shadow-primary/30 transition-transform group-hover:scale-105">
        <Sparkles className="h-4 w-4" strokeWidth={2.4} />
      </span>
      {showWordmark ? (
        <span className="text-base">{env.siteName}</span>
      ) : null}
    </Link>
  );
}
