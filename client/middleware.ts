import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "access_token";

const PROTECTED_PREFIXES = ["/dashboard", "/subjects", "/settings"];
const AUTH_PAGES = ["/login", "/register"];

export function middleware(request: NextRequest) {
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
    "/dashboard/:path*",
    "/subjects/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
