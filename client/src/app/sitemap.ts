import type { MetadataRoute } from "next";
import { getAllSeoPages } from "@/content/seo/registry";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.siteUrl;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const seoRoutes: MetadataRoute.Sitemap = getAllSeoPages().map((page) => ({
    url: `${base}/${page.slug}`,
    lastModified: page.updatedAt ? new Date(page.updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...seoRoutes];
}
