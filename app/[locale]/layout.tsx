import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { localeDirection, routing, type Locale } from '@/i18n/routing';
import '../globals.css';

/** Where this site lives — absolute URLs in link previews and the sitemap are built from it. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinansmile.online';

/** Title and description in the visitor's language, plus what a shared link shows. */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale, namespace: 'meta' });
  return {
    metadataBase: new URL(SITE_URL),
    title: t('title'),
    description: t('description'),
    icons: { icon: '/favicon-sinan.png' },
    alternates: {
      canonical: `/${locale}`,
      languages: { ar: '/ar', en: '/en', 'x-default': '/ar' },
    },
    openGraph: {
      type: 'website',
      siteName: 'Sinan',
      title: t('title'),
      description: t('description'),
      url: `/${locale}`,
      locale: locale === 'ar' ? 'ar_LB' : 'en_US',
      images: [{ url: '/logo.png' }],
    },
    twitter: { card: 'summary', title: t('title'), description: t('description'), images: ['/logo.png'] },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Sets `lang` and `dir` on <html>.
 *
 * `dir` belongs here and nowhere else: it is derived from the locale, and every
 * logical CSS property in the app resolves against it. Setting it lower down, or
 * per-component, is how an RTL layout ends up half-flipped.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale} dir={localeDirection[locale as Locale]} data-scroll-behavior="smooth">
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
