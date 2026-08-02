import type { NextConfig } from "next";

function resolveProxyTarget(): string | null {
  const explicitTarget = process.env.NEXT_API_PROXY_TARGET;
  if (explicitTarget) return explicitTarget.replace(/\/$/, "");

  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!publicApiUrl) return null;
  if (publicApiUrl.startsWith("http://") || publicApiUrl.startsWith("https://")) {
    return publicApiUrl.replace(/\/$/, "");
  }
  return null;
}

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  /**
   * Host-level redirect as a code safety net.
   * On Vercel, also set myremynd.com as the primary domain so www redirects
   * at the edge before the app. Keep both in sync to avoid www/non-www duplicates.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.myremynd.com" }],
        destination: "https://myremynd.com/:path*",
        permanent: true, // 308
      },
    ];
  },
  async rewrites() {
    const target = resolveProxyTarget();
    if (!target) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${target}/:path*`,
      },
    ];
  },
};

export default config;
