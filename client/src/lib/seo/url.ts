import { env } from "../env";

/**
 * Build an absolute canonical URL on the preferred host (env.siteUrl).
 * Paths are normalized without a trailing slash, except for the site root
 * (returned as `${base}/`). Next.js Metadata may serialize the root without
 * the trailing slash when `trailingSlash` is false — both are apex/non-www.
 */
export function absoluteUrl(path = "/", baseUrl: string = env.siteUrl): string {
  const base = baseUrl.replace(/\/$/, "");
  if (!path || path === "/") {
    return `${base}/`;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized.replace(/\/$/, "")}`;
}
