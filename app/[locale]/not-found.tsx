import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

/**
 * The "not found" page for an address under a language — what
 * [...rest]/page.tsx hands every such address to.
 *
 * Without it Next shows its own: English only, on a white page, with no way
 * back — on a site whose first language is Arabic. This one sits inside the
 * language's layout, so it has the visitor's language, its direction, and the
 * same look as the legal pages.
 */
export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <main className="sinan-bg flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="glass anim-scale-in w-full max-w-md rounded-3xl p-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="mx-auto h-12 w-12 object-contain" />
        <p className="mt-4 text-5xl font-black text-white" dir="ltr">404</p>
        <h1 className="mt-2 text-xl font-extrabold text-white">{t('title')}</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/80">{t('body')}</p>
        <Link href="/" className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 text-sm font-bold text-[var(--color-teal-deep)] transition-all hover:-translate-y-0.5 active:translate-y-0">
          {t('home')}
        </Link>
      </div>
    </main>
  );
}
