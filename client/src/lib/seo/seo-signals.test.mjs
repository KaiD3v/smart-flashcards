import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * Mirrors src/lib/seo/url.ts and build-sitemap.ts so Node can run tests
 * without TypeScript path aliases. Keep in sync with those modules.
 */
function absoluteUrl(path = "/", baseUrl = "https://myremynd.com") {
  const base = baseUrl.replace(/\/$/, "");
  if (!path || path === "/") return `${base}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized.replace(/\/$/, "")}`;
}

const AUTH_PATHS = new Set(["/login", "/register"]);

function buildSitemapEntries(staticRoutes, seoPages) {
  const staticEntries = staticRoutes
    .filter((route) => !AUTH_PATHS.has(route.path))
    .map((route) => {
      const entry = {
        url: absoluteUrl(route.path),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      };
      if (route.lastModified) entry.lastModified = new Date(route.lastModified);
      return entry;
    });

  const seoEntries = seoPages.map((page) => {
    const entry = {
      url: absoluteUrl(`/${page.slug}`),
      changeFrequency: "monthly",
      priority: 0.8,
    };
    const modified = page.updatedAt ?? page.publishedAt;
    if (modified) entry.lastModified = new Date(modified);
    return entry;
  });

  return [...staticEntries, ...seoEntries];
}

function assertPublicSitemap(entries) {
  for (const entry of entries) {
    const pathname = new URL(entry.url).pathname.replace(/\/$/, "") || "/";
    if (AUTH_PATHS.has(pathname)) {
      throw new Error(`Sitemap must not include auth path: ${entry.url}`);
    }
    if (entry.url.includes("://www.")) {
      throw new Error(`Sitemap URL must use non-www host: ${entry.url}`);
    }
    if (
      !entry.url.startsWith("https://") &&
      !entry.url.startsWith("http://localhost")
    ) {
      throw new Error(`Sitemap URL must be absolute http(s): ${entry.url}`);
    }
  }
}

describe("SEO URL helpers", () => {
  it("builds root canonical with trailing slash", () => {
    assert.equal(absoluteUrl("/"), "https://myremynd.com/");
  });

  it("builds path URLs without www or trailing slash", () => {
    assert.equal(absoluteUrl("/guides"), "https://myremynd.com/guides");
    assert.equal(
      absoluteUrl("/anki-alternative"),
      "https://myremynd.com/anki-alternative"
    );
    assert.equal(absoluteUrl("/guides").includes("://www."), false);
  });
});

describe("sitemap entries", () => {
  it("excludes auth routes and omits fabricated lastModified", () => {
    const entries = buildSitemapEntries(
      [
        { path: "/", changeFrequency: "weekly", priority: 1 },
        { path: "/guides", changeFrequency: "weekly", priority: 0.9 },
        { path: "/login", changeFrequency: "monthly", priority: 0.5 },
        { path: "/register", changeFrequency: "monthly", priority: 0.5 },
      ],
      [
        { slug: "anki-alternative", updatedAt: "2025-06-01" },
        { slug: "spaced-repetition" },
      ]
    );

    assert.deepEqual(
      entries.map((e) => e.url),
      [
        "https://myremynd.com/",
        "https://myremynd.com/guides",
        "https://myremynd.com/anki-alternative",
        "https://myremynd.com/spaced-repetition",
      ]
    );

    assert.equal(
      entries.find((e) => e.url.endsWith("myremynd.com/"))?.lastModified,
      undefined
    );
    assert.equal(
      entries.find((e) => e.url.endsWith("/guides"))?.lastModified,
      undefined
    );
    assert.ok(
      entries.find((e) => e.url.endsWith("/anki-alternative"))
        ?.lastModified instanceof Date
    );
    assert.equal(
      entries.find((e) => e.url.endsWith("/spaced-repetition"))?.lastModified,
      undefined
    );
  });

  it("rejects auth and www URLs", () => {
    assert.throws(() =>
      assertPublicSitemap([{ url: "https://myremynd.com/login" }])
    );
    assert.throws(() =>
      assertPublicSitemap([{ url: "https://www.myremynd.com/" }])
    );
  });
});
