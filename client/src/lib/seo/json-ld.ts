import type { SeoPageContent } from "@/content/seo/types";
import { CLUSTER_LABELS } from "@/lib/seo/constants";
import { env } from "@/lib/env";
import { absoluteUrl } from "@/lib/seo/url";

export function buildArticleJsonLd(page: SeoPageContent) {
  const url = absoluteUrl(`/${page.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.h1,
    description: page.metaDescription,
    author: { "@type": "Organization", name: env.siteName },
    publisher: {
      "@type": "Organization",
      name: env.siteName,
      url: env.siteUrl,
    },
    datePublished: page.publishedAt ?? "2025-06-01",
    dateModified: page.updatedAt ?? page.publishedAt ?? "2025-06-01",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: [page.primaryKeyword, ...page.secondaryKeywords].join(", "),
  };
}

export function buildFaqJsonLd(page: SeoPageContent) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(page: SeoPageContent) {
  const clusterLabel = CLUSTER_LABELS[page.cluster];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: clusterLabel,
        item: `${absoluteUrl("/guides")}#${page.cluster}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.h1,
        item: absoluteUrl(`/${page.slug}`),
      },
    ],
  };
}

export function buildSeoJsonLd(page: SeoPageContent) {
  return [buildArticleJsonLd(page), buildFaqJsonLd(page), buildBreadcrumbJsonLd(page)];
}
