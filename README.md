# sinan-landing

Next.js (App Router) + TypeScript + Tailwind 4. The public marketing site:
the landing page, and the privacy / terms pages the App Store links to.

It is a separate website from the dashboard (`sinan-web`). Nothing here needs a
sign-in, and nothing here links to the dashboard — clinic staff go to it directly.

```bash
npm install
npm run dev          # http://localhost:3302/ar
```

`app/globals.css` and `app/tokens.css` are copies of the ones in `sinan-web` —
the two sites share one visual identity. Change a token in both.

## Building for production

`next build` fails unless `NEXT_PUBLIC_API_URL` is an **https** address — the
join form posts a doctor's name and phone number there. To test a production
build against a local API: `ALLOW_INSECURE_LOCAL_BUILD=1 npx next build`
(allows `http://localhost` only; never deploy that build).

## What the site sends

[`next.config.ts`](next.config.ts): `nosniff`, a strict `Referrer-Policy`,
`X-Frame-Options: DENY`, a `Permissions-Policy` that turns off camera,
microphone and geolocation, `Cross-Origin-Opener-Policy: same-origin`, and in
production `Strict-Transport-Security: max-age=63072000; includeSubDomains`.
[`proxy.ts`](proxy.ts) adds a Content-Security-Policy with a per-response
nonce to every answer outside `/_next`: the site's own scripts only, and
requests to the API only. That includes the "not found" page — the translated
one under `/ar` and `/en`, and the plain one a mistyped file name gets. The
framework's own `/_next` paths carry a fixed policy that allows no script at
all. The language cookie is `Secure` in production.

The join form carries a field named `website` that no person sees (bots fill
it; the API then stores nothing) and is not sent sooner than three seconds
after it was shown.
