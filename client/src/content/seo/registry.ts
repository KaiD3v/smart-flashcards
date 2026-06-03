import type { SeoPageContent } from "./types";
import { validateSeoRegistry } from "./validate";
import { seoPages } from "./pages";

const pageMap = new Map<string, SeoPageContent>(
  seoPages.map((page) => [page.slug, page])
);

validateSeoRegistry(seoPages);

export function getAllSeoPages(): SeoPageContent[] {
  return seoPages;
}

export function getPageBySlug(slug: string): SeoPageContent | undefined {
  return pageMap.get(slug);
}

export function getSeoSlugs(): string[] {
  return seoPages.map((p) => p.slug);
}

export function getPagesByCluster(
  cluster: SeoPageContent["cluster"]
): SeoPageContent[] {
  return seoPages.filter((p) => p.cluster === cluster);
}
