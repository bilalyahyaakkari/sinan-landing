import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

/**
 * The public legal pages — no sign-in, crawlable, linkable from the App Store.
 *
 * Content comes live from the platform settings the admin edits; the page
 * renders on the server so the URL works for Apple's reviewer with JS off.
 */
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3300';

interface Legal {
  termsEn: string | null;
  termsAr: string | null;
  privacyEn: string | null;
  privacyAr: string | null;
}

export async function LegalPage({ locale, doc }: { locale: string; doc: 'terms' | 'privacy' }) {
  const t = await getTranslations('legalPublic');
  let legal: Legal | null = null;
  try {
    const res = await fetch(`${API}/discovery/legal`, { next: { revalidate: 300 } });
    if (res.ok) legal = (await res.json()) as Legal;
  } catch {
    legal = null;
  }

  const ar = locale === 'ar';
  const text =
    (doc === 'terms' ? (ar ? legal?.termsAr : legal?.termsEn) : ar ? legal?.privacyAr : legal?.privacyEn) ??
    (doc === 'terms' ? (legal?.termsAr ?? legal?.termsEn) : (legal?.privacyAr ?? legal?.privacyEn)) ??
    t('unavailable');

  return (
    <main className="sinan-bg min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="anim-fade-up mb-6 flex items-center gap-3">
          <div className="glass flex h-12 w-12 items-center justify-center rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Sinan" className="h-8 w-8 object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold text-white">{doc === 'terms' ? t('termsTitle') : t('privacyTitle')}</h1>
            <p className="text-2xs text-white/70">{t('appName')}</p>
          </div>
          {/* The same document in the other language — a link, never a guess. */}
          <Link href={`/${doc}`} locale={ar ? 'en' : 'ar'} className="glass rounded-full px-3 py-1.5 text-xs font-bold text-white">
            {ar ? 'English' : 'العربية'}
          </Link>
        </div>

        <article className="glass anim-scale-in d1 rounded-3xl p-6 sm:p-8">
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-white/95">{text}</div>
        </article>

        <p className="anim-fade-up d3 mt-6 text-center text-xs">
          <Link href="/" className="font-semibold text-white/85 underline underline-offset-4 hover:text-white">
            {t('home')}
          </Link>
        </p>
        <p className="anim-fade-up d3 mt-3 text-center text-2xs text-white/50">{t('footer')}</p>
      </div>
    </main>
  );
}
