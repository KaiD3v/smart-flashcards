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
