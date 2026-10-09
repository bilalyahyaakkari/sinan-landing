import { NextRequest, NextResponse } from 'next/server';
import createProxy from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { API_URL, PRODUCTION } from './lib/config';

const localeRouting = createProxy(routing);

/**
 * The Content-Security-Policy for a page of this site.
 *
 * The site loads nothing from anyone else: its own scripts and styles, its own
 * images, and the API for the packages list and the join form. So the policy
 * is short — and it still needs a nonce. Next writes small inline scripts into
 * every page to start it up; without `'unsafe-inline'` (which would allow any
 * injected script as well) the only way to let those run is to mark them, per
 * response, with a value nobody else can know. Next reads the nonce from the
 * request's own Content-Security-Policy header and stamps it on each script.
 *
 * `style-src 'unsafe-inline'` is the one loose line: the design sets `style`
 * attributes throughout, and a style cannot send a visitor's phone number
 * anywhere. `'unsafe-eval'` and the hot-reload socket are development only.
 */
function contentSecurityPolicy(nonce: string): string {
  let api: string[] = [];
  try {
    api = API_URL ? [new URL(API_URL).origin] : [];
  } catch {
    api = [];
  }
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${PRODUCTION ? '' : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    `connect-src ${["'self'", ...api, ...(PRODUCTION ? [] : ['ws:'])].join(' ')}`,
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

/**
 * Two jobs, on every request the site answers itself: the policy above, and
 * locale routing — plus one thing next-intl stops doing once browser detection
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
  // 128 random bits, new for every response.
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  const policy = contentSecurityPolicy(nonce);

  // Set, not appended: whatever a visitor sent under these names is replaced,
  // so the nonce Next uses is always the one made above. next-intl copies the
  // request's headers onto the one it forwards, which carries these along.
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', policy);

  const { pathname } = request.nextUrl;
  const named = routing.locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  // A file — the logo, robots.txt — or an address shaped like one. It has no
  // language, so next-intl is not asked: it would send /logo.png to
  // /ar/logo.png. It still gets the nonce and the policy. When no such file
  // exists the answer is a "not found" page drawn for this request, and its
  // scripts must be marked like any other page's — under a policy with no
  // nonce in it, a mistyped file name was a blank page and a console full of
  // violations.
  if (!named && pathname.includes('.')) {
    const file = NextResponse.next({ request: { headers } });
    file.headers.set('Content-Security-Policy', policy);
    return file;
  }

  const chosen = request.cookies.get('NEXT_LOCALE')?.value;
  if (!named && chosen && chosen !== routing.defaultLocale && (routing.locales as readonly string[]).includes(chosen)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${chosen}${pathname === '/' ? '' : pathname}`;
    const redirect = NextResponse.redirect(url);
    redirect.headers.set('Content-Security-Policy', policy);
    return redirect;
  }

  const response = localeRouting(new NextRequest(request, { headers }));
  response.headers.set('Content-Security-Policy', policy);
  return response;
}

export const config = {
  /**
   * Everything except the framework's own paths: any other address can end in
   * a page — the one asked for, or the "not found" one — so none goes without
   * the policy. next.config.ts sends a fixed, script-less policy for exactly
   * the paths this leaves out; keep the two files in step.
   */
  matcher: '/((?!_next|_vercel).*)',
};
