import { NextResponse, type NextRequest } from 'next/server';
import createProxy from 'next-intl/middleware';
import { routing } from './i18n/routing';

const localeRouting = createProxy(routing);

/**
 * Locale routing, plus one thing next-intl stops doing once browser detection
 * is switched off (i18n/routing.ts): honouring the language someone chose.
 *
 * A URL that names its language is always obeyed. One that does not — "/" —
 * would fall back to Arabic every time, even for the visitor who switched to
 * English a minute ago. The language link records the choice in the
 * NEXT_LOCALE cookie, so an unprefixed path is sent to that language instead.
 * No cookie (a first visit) still means Arabic; the browser's own language is
 * never consulted.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const named = routing.locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  const chosen = request.cookies.get('NEXT_LOCALE')?.value;
  if (!named && chosen && chosen !== routing.defaultLocale && (routing.locales as readonly string[]).includes(chosen)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${chosen}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }
  return localeRouting(request);
}

export const config = {
  // Locale-route everything except framework paths and files with an extension.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
