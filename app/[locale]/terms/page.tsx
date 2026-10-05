import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPage } from '../legal-page';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('termsTitle'),
    alternates: { canonical: `/${locale}/terms`, languages: { ar: '/ar/terms', en: '/en/terms' } },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage locale={locale} doc="terms" />;
}
