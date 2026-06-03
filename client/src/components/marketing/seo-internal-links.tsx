import Link from "next/link";
import type { SeoPageContent } from "@/content/seo/types";
import { getPageBySlug } from "@/content/seo/registry";

export function SeoInternalLinks({ page }: { page: SeoPageContent }) {
  const related = page.relatedSlugs
    .map((slug) => getPageBySlug(slug))
    .filter((p): p is SeoPageContent => p !== undefined);

  return (
    <section className="py-12 sm:py-16" aria-labelledby="related-heading">
      <h2
        id="related-heading"
        className="text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        Related guides
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {related.map((relatedPage) => (
          <li key={relatedPage.slug}>
            <Link
              href={`/${relatedPage.slug}`}
              className="block rounded-xl border border-border/80 bg-card/40 px-4 py-3 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-accent/50"
            >
              {relatedPage.h1}
            </Link>
          </li>
        ))}
      </ul>
      <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <Link href="/register" className="hover:text-foreground">
          Create account
        </Link>
        <Link href="/login" className="hover:text-foreground">
          Sign in
        </Link>
        <Link href="/guides" className="hover:text-foreground">
          All guides
        </Link>
      </nav>
    </section>
  );
}
