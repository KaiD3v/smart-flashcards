import type { MetadataRoute } from "next";
import { getAllSeoPages } from "@/content/seo/registry";
import {
  assertPublicSitemap,
  buildSitemapEntries,
} from "@/lib/seo/build-sitemap";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries = buildSitemapEntries(
    [
      { path: "/", changeFrequency: "weekly", priority: 1 },
      { path: "/guides", changeFrequency: "weekly", priority: 0.9 },
    ],
    getAllSeoPages()
  );

  assertPublicSitemap(entries);
  return entries;
}
