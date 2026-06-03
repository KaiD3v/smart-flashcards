import type { SeoPageContent } from "@/content/seo/types";
import { SeoCtaBand } from "./seo-cta-band";

export function SeoArticle({ page }: { page: SeoPageContent }) {
  const midIndex = Math.floor(page.sections.length / 2);

  return (
    <article className="prose-seo mx-auto max-w-3xl">
      <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
        {page.intro}
      </p>

      {page.sections.map((section, index) => {
        const HeadingTag = section.level === 2 ? "h2" : "h3";
        const showMidCta = index === midIndex;

        return (
          <div key={section.id} className="mt-10">
            <HeadingTag
              id={section.id}
              className={
                section.level === 2
                  ? "text-2xl font-semibold tracking-tight scroll-mt-24 sm:text-3xl"
                  : "text-xl font-semibold tracking-tight scroll-mt-24"
              }
            >
              {section.heading}
            </HeadingTag>
            <div className="mt-4 space-y-4">
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="text-base text-muted-foreground text-pretty leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            {showMidCta ? (
              <div className="mt-10">
                <SeoCtaBand variant="mid" />
              </div>
            ) : null}
          </div>
        );
      })}
    </article>
  );
}
