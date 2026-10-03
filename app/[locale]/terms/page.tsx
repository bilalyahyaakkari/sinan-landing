import { LegalPage } from '../legal-page';

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage locale={locale} doc="terms" />;
}
