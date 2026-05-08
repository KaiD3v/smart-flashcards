const DEFAULT_API_URL = "/api";
const DEFAULT_COOKIE_NAME = "access_token";
const DEFAULT_SITE_NAME = "SmartFlashcards";

export const env = {
  apiUrl: (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, ""),
  authCookieName: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? DEFAULT_COOKIE_NAME,
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? DEFAULT_SITE_NAME,
} as const;
