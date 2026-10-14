import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

/*
 * Every page address without a language goes to the Dutch version: / → /nl, /works → /nl/works.
 * The browser's language is deliberately ignored; English is only reached via the switcher.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isLocale(pathname.split("/")[1])) return;
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Not for the API, Next's own files, images and media, or files with an extension
  // (robots.txt, sitemap.xml, favicon.ico, …).
  matcher: ["/((?!api|_next|_vercel|media|images|brand|cv|.*\\.[\\w]+$).*)"],
};
