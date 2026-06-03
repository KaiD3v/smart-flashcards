import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { SeoPageContent } from "@/content/seo/types";
import { CLUSTER_LABELS } from "@/lib/seo/constants";

export function SeoBreadcrumbs({ page }: { page: SeoPageContent }) {
  const clusterLabel = CLUSTER_LABELS[page.cluster];

  return (
    <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
        </li>
        <li aria-hidden className="flex items-center">
          <ChevronRight className="h-3.5 w-3.5" />
        </li>
        <li>
          <Link href="/guides" className="hover:text-foreground">
            Guides
          </Link>
        </li>
        <li aria-hidden className="flex items-center">
          <ChevronRight className="h-3.5 w-3.5" />
        </li>
        <li>
          <Link
            href={`/guides#${page.cluster}`}
            className="hover:text-foreground"
          >
            {clusterLabel}
          </Link>
        </li>
        <li aria-hidden className="flex items-center">
          <ChevronRight className="h-3.5 w-3.5" />
        </li>
        <li className="text-foreground font-medium truncate max-w-[12rem] sm:max-w-none">
          {page.h1}
        </li>
      </ol>
    </nav>
  );
}
