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
