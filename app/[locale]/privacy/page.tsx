import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPage } from '../legal-page';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('privacyTitle'),
    alternates: { canonical: `/${locale}/privacy`, languages: { ar: '/ar/privacy', en: '/en/privacy' } },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage locale={locale} doc="privacy" />;
}
