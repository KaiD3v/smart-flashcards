import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CtaVariant = "hero" | "mid" | "final";

const CTA_COPY: Record<CtaVariant, { text: string; href: string }> = {
  hero: {
    text: "Start creating flashcards with AI.",
    href: "/register",
  },
  mid: {
    text: "Upload a PDF and generate flashcards instantly.",
    href: "/register",
  },
  final: {
    text: "Turn hours of study material into smart flashcards in seconds.",
    href: "/register",
  },
};

export function SeoCtaBand({
  variant,
  className,
}: {
  variant: CtaVariant;
  className?: string;
}) {
  const { text, href } = CTA_COPY[variant];
  const isFinal = variant === "final";

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card/60 p-8 text-center sm:p-10",
        isFinal && "bg-muted/40",
        className
      )}
    >
      <p className="text-lg font-medium text-balance sm:text-xl">{text}</p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild size="xl" variant="gradient">
          <Link href={href}>
            Get started free
            <ArrowRight />
          </Link>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </div>
  );
}
