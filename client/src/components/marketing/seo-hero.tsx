import type { SeoPageContent } from "@/content/seo/types";
import { Badge } from "@/components/ui/badge";
import { SeoCtaBand } from "./seo-cta-band";

export function SeoHero({ page }: { page: SeoPageContent }) {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <Badge variant="default" className="mb-4 text-[11px]">
        {page.primaryKeyword}
      </Badge>
      <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        {page.h1}
      </h1>
      <div className="mt-8">
        <SeoCtaBand variant="hero" />
      </div>
    </header>
  );
}
