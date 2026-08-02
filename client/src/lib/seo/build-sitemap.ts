import type { MetadataRoute } from "next";
import type { SeoPageContent } from "../../content/seo/types";
import { absoluteUrl } from "./url";

const AUTH_PATHS = new Set(["/login", "/register"]);

export type SitemapEntryInput = {
  path: string;
  lastModified?: string | Date;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
};

/**
 * Build public, indexable sitemap entries. Auth and private routes are excluded.
 * lastModified is only set when a real date is provided.
 */
export function buildSitemapEntries(
  staticRoutes: SitemapEntryInput[],
  seoPages: Pick<SeoPageContent, "slug" | "updatedAt" | "publishedAt">[]
): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes
    .filter((route) => !AUTH_PATHS.has(route.path))
    .map((route) => {
      const entry: MetadataRoute.Sitemap[number] = {
        url: absoluteUrl(route.path),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      };
      if (route.lastModified) {
        entry.lastModified = new Date(route.lastModified);
      }
      return entry;
    });

  const seoEntries: MetadataRoute.Sitemap = seoPages.map((page) => {
    const entry: MetadataRoute.Sitemap[number] = {
      url: absoluteUrl(`/${page.slug}`),
      changeFrequency: "monthly",
      priority: 0.8,
    };
    const modified = page.updatedAt ?? page.publishedAt;
    if (modified) {
      entry.lastModified = new Date(modified);
    }
    return entry;
  });

  return [...staticEntries, ...seoEntries];
}

export function assertPublicSitemap(entries: MetadataRoute.Sitemap): void {
  for (const entry of entries) {
    const pathname = new URL(entry.url).pathname.replace(/\/$/, "") || "/";
    if (AUTH_PATHS.has(pathname)) {
      throw new Error(`Sitemap must not include auth path: ${entry.url}`);
    }
    if (entry.url.includes("://www.")) {
      throw new Error(`Sitemap URL must use non-www host: ${entry.url}`);
    }
    if (!entry.url.startsWith("https://") && !entry.url.startsWith("http://localhost")) {
      throw new Error(`Sitemap URL must be absolute http(s): ${entry.url}`);
    }
  }
}
