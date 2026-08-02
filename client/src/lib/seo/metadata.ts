import type { Metadata } from "next";
import type { SeoPageContent } from "../../content/seo/types";
import { env } from "../env";
import { absoluteUrl } from "./url";

export function buildSeoMetadata(page: SeoPageContent): Metadata {
  const canonical = absoluteUrl(`/${page.slug}`);
  const keywords = [page.primaryKeyword, ...page.secondaryKeywords];

  return {
    title: page.seoTitle,
    description: page.metaDescription,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: page.seoTitle,
      description: page.metaDescription,
      url: canonical,
      siteName: env.siteName,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: page.seoTitle,
      description: page.metaDescription,
    },
  };
}
