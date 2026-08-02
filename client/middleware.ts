import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "access_token";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CANONICAL_HOST = "myremynd.com";
const WWW_HOST = `www.${CANONICAL_HOST}`;

const PROTECTED_PREFIXES = ["/dashboard", "/subjects", "/settings"];
const AUTH_PAGES = ["/login", "/register"];

function isApiSameOrigin(request: NextRequest): boolean {
  if (!API_URL) return true;
  try {
    const apiOrigin = new URL(API_URL).origin;
    return apiOrigin === request.nextUrl.origin;
  } catch {
    // If API URL is invalid, keep middleware guard behavior.
    return true;
  }
}

function redirectWwwToApex(request: NextRequest): NextResponse | null {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (host !== WWW_HOST) return null;

  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.hostname = CANONICAL_HOST;
  url.port = "";
  // Preserve pathname and query string via cloned nextUrl.
  return NextResponse.redirect(url, 308);
}

export function middleware(request: NextRequest) {
  const wwwRedirect = redirectWwwToApex(request);
  if (wwwRedirect) return wwwRedirect;

  if (!isApiSameOrigin(request)) {
    // Cross-origin auth cookie is not visible to the frontend domain in middleware.
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthed = Boolean(token);

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthPage = AUTH_PAGES.some((page) => pathname === page);

  if (isProtected && !isAuthed) {
    const next = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(
      new URL(`/login?next=${next}`, request.url)
    );
  }

  if (isAuthPage && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on all app routes so www → apex applies site-wide.
     * Skip Next internals and common static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
