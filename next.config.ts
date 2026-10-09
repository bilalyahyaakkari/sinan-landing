import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * A production build must know where the real API is — and it must be https.
 *
 * The address is compiled into the bundle. Missing, the site used to fall back
 * to http://localhost:3300: it built without complaint and then posted every
 * doctor's name and phone number from the join form to the visitor's own
 * machine. So the build stops here instead. The dashboard has the same rule.
 *
 * `ALLOW_INSECURE_LOCAL_BUILD=1 next build` is the one exception, for testing
 * a production build on a developer's machine: it allows http://localhost and
 * nothing else. Checked when building only — `next start` serves what was
 * already compiled.
 */
function checkApiAddress(): void {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  let url: URL | null = null;
  try {
    url = raw ? new URL(raw) : null;
  } catch {
    url = null;
  }
  if (!url) {
    throw new Error(
      '[sinan] NEXT_PUBLIC_API_URL is missing (or is not a URL). A production build needs the public https address of sinan-api, e.g. https://api.example.com — set it and build again.',
    );
  }
  if (url.protocol === 'https:') return;

  const local = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (local && process.env.ALLOW_INSECURE_LOCAL_BUILD === '1') {
    console.warn('[sinan] ALLOW_INSECURE_LOCAL_BUILD=1 — this production build talks to a local API over http. It is for testing on this machine. Never deploy it.');
    return;
  }
  throw new Error(
    `[sinan] NEXT_PUBLIC_API_URL is "${url.origin}", which is not https. ` +
      (local
        ? 'To build against a local API for testing, run the build with ALLOW_INSECURE_LOCAL_BUILD=1.'
        : 'Use the https address of the API.'),
  );
}

/**
 * The same baseline the dashboard sends: believe our Content-Type, keep paths
 * out of the Referer, and never be drawn inside someone else's page (the lead
 * form is the one thing here worth clickjacking).
 *
 * The Content-Security-Policy for pages is NOT here: it carries a nonce that
 * is new for every response, so proxy.ts writes it. Below is only the fixed
 * policy for what the proxy never sees.
 */
const everywhere = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  // A marketing page has no use for any of these, so no script in it — ours or
  // one that got in — may ask a visitor for them.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // A window this site opens, or is opened from, gets no handle on it. Nothing
  // here signs in through a pop-up — the dashboard does, and so allows them —
  // so the strictest value costs nothing; the WhatsApp link opens `noreferrer`.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // https only, for two years, said by the site itself and not left to the
  // host's defaults. Production only: on http://localhost a browser ignores it.
  ...(PRODUCTION ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }] : []),
];

/**
 * The policy for what proxy.ts does not handle: the framework's own /_next
 * assets (and the host's /_vercel paths). None of them is a page, so nothing
 * in them may run a script or call anywhere.
 *
 * The pattern is the exact complement of the matcher in proxy.ts. If the two
 * overlapped, a response would carry two policies and the browser would apply
 * both at once: this one, which allows no script, would switch every page off.
 * Change them together.
 */
const NOT_A_PAGE = '/((?:_next|_vercel).*)';
const STATIC_POLICY = "default-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

/**
 * `next typegen` only writes route types, but it loads this file the way a
 * build does. It ships nothing, so it is not held to the build's rule — a
 * developer regenerating types should not need a production API address.
 */
const BUILDING = (phase: string) => phase === PHASE_PRODUCTION_BUILD && !process.argv.includes('typegen');

export default function config(phase: string): NextConfig {
  if (BUILDING(phase)) checkApiAddress();

  const nextConfig: NextConfig = {
    poweredByHeader: false,

    // The site uses plain <img>, never next/image. Switched off so the image
    // optimiser's endpoint (/_next/image) does not exist to be probed.
    images: { unoptimized: true },

    async headers() {
      return [
        { source: '/:path*', headers: everywhere },
        { source: NOT_A_PAGE, headers: [{ key: 'Content-Security-Policy', value: STATIC_POLICY }] },
      ];
    },
  };

  return withNextIntl(nextConfig);
}
