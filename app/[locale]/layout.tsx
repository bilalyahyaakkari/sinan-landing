import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { localeDirection, routing, type Locale } from '@/i18n/routing';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Sinan',
  description: 'Practice software for dental clinics',
  icons: { icon: '/favicon-sinan.png' },
};

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
    <html lang={locale} dir={localeDirection[locale as Locale]}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
