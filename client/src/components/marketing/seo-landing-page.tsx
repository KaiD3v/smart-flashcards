import type { SeoPageContent } from "@/content/seo/types";
import { BackgroundDecor } from "./background-decor";
import { SeoBreadcrumbs } from "./seo-breadcrumbs";
import { SeoHero } from "./seo-hero";
import { SeoArticle } from "./seo-article";
import { SeoFaq } from "./seo-faq";
import { SeoInternalLinks } from "./seo-internal-links";
import { SeoCtaBand } from "./seo-cta-band";
import { SeoJsonLd } from "./seo-json-ld";

export function SeoLandingPage({ page }: { page: SeoPageContent }) {
  return (
    <div className="relative">
      <SeoJsonLd page={page} />
      <BackgroundDecor />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <SeoBreadcrumbs page={page} />
        <SeoHero page={page} />
        <div className="mt-14">
          <SeoArticle page={page} />
        </div>
        <div className="mx-auto max-w-3xl mt-14">
          <SeoFaq faqs={page.faqs} />
        </div>
        <div className="mx-auto max-w-3xl mt-10">
          <SeoCtaBand variant="final" />
        </div>
        <div className="mx-auto max-w-3xl">
          <SeoInternalLinks page={page} />
        </div>
      </div>
    </div>
  );
}
