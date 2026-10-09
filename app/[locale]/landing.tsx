'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { API_URL as API } from '@/lib/config';

interface PublicPlan {
  id: string;
  name: string;
  priceUsd: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
}

/** Reveal children when they scroll into view. */
function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal, .reveal-pop, .reveal-left, .reveal-right'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** Count from 0 → target once visible. */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      const start = performance.now();
      const dur = 1400;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        setN(Math.round((1 - Math.pow(1 - p, 3)) * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    // Already on screen at mount? animate right away.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) run();
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return (
    <span ref={ref} className="count">
      {n}
      {suffix}
    </span>
  );
}

/** An <img> that quietly falls back to a teal panel if the file isn't there yet. */
function Shot({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div
        className={`flex aspect-[16/10] w-full items-center justify-center ${className ?? ''}`}
        style={{ background: 'linear-gradient(150deg, var(--color-teal-deep), var(--color-teal-mid) 55%, var(--color-teal-soft))' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="h-16 w-16 object-contain opacity-70" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} onError={() => setBroken(true)} className={`block w-full ${className ?? ''}`} />
  );
}

/** Same, but for phones — the whole screenshot, never cropped. */
function ShotContain({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ background: 'linear-gradient(150deg, var(--color-teal-deep), var(--color-teal-mid) 55%, var(--color-teal-soft))' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="h-16 w-16 object-contain opacity-70" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} onError={() => setBroken(true)} className="h-full w-full object-contain" />
  );
}

/** A phone with a screenshot filling its screen; Dynamic-Island pill centered. */
function Phone({ src, className, style, onClick }: { src: string; className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  const t = useTranslations('marketing');
  return (
    <div
      onClick={onClick}
      {...(onClick
        ? {
            role: 'button',
            tabIndex: 0,
            onKeyDown: (e: React.KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick()),
          }
        : {})}
      className={`group/phone relative rounded-[2.4rem] border-[7px] border-slate-900 bg-slate-900 shadow-2xl transition-transform duration-300 ${onClick ? 'cursor-pointer hover:!scale-105 hover:z-20' : ''} ${className ?? ''}`}
      style={{ width: 220, height: 464, ...style }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[1.9rem] bg-black">
        <ShotContain src={src} alt={t('patients.shotAlt')} />
        {/* Dynamic-Island pill — dead-centered above the screenshot */}
        <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center">
          <div className="h-[22px] w-[74px] rounded-full bg-black" />
        </div>
      </div>
    </div>
  );
}

/** A browser window with a dashboard screenshot inside. */
function Browser({ src }: { src: string }) {
  const t = useTranslations('marketing');
  return (
    <div className="overflow-hidden rounded-2xl border border-white/20 bg-slate-800 shadow-2xl">
      <div className="flex items-center gap-1.5 bg-slate-800 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <div className="mx-auto flex items-center gap-1.5 rounded-md bg-slate-700/70 px-3 py-1 text-2xs text-white/50">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          app.sinansmile.com
        </div>
      </div>
      <div className="w-full bg-white">
        <Shot src={src} alt={t('doctors.shotAlt')} />
      </div>
    </div>
  );
}

/** How to reach Sinan — set by the platform admin; any of the three may be empty. */
interface SupportInfo {
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
}

/** Loading, loaded, or failed — "not set" and "could not load" are different answers. */
type ContactState =
  | { status: 'closed' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; info: SupportInfo };

function ContactDialog({
  state,
  onRetry,
  onClose,
}: {
  state: ContactState;
  onRetry: () => void;
  onClose: () => void;
}) {
  const t = useTranslations('marketing.contact');
  const info = state.status === 'ready' ? state.info : null;
  const empty = !info?.phone && !info?.email && !info?.whatsapp;
  const closeRef = useRef<HTMLButtonElement>(null);

  // A dialog owns the keyboard while it is open: Escape leaves, focus starts
  // inside it, and the page behind does not scroll away underneath.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        onClick={(e) => e.stopPropagation()}
        className="anim-scale-in w-full max-w-sm rounded-3xl bg-white p-6 text-sand-900 shadow-2xl"
      >
        <h2 id="contact-title" className="text-base font-bold">{t('title')}</h2>
        <p className="mt-1 text-xs text-sand-500">
          {state.status === 'loading'
            ? t('loading')
            : state.status === 'error'
              ? t('loadFailed')
              : empty
                ? t('unavailable')
                : t('hint')}
        </p>
        {state.status === 'error' && (
          <button
            onClick={onRetry}
            className="mt-3 rounded-xl bg-[var(--color-teal-deep)] px-3 py-2 text-xs font-semibold text-white"
          >
            {t('retry')}
          </button>
        )}
        <div className="mt-4 space-y-2">
          {info?.whatsapp && (
            <ContactRow
              href={`https://wa.me/${info.whatsapp.replace(/[^0-9]/g, '')}`}
              label={t('whatsapp')}
              value={info.whatsapp}
              icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          )}
          {info?.phone && (
            <ContactRow
              href={`tel:${info.phone}`}
              label={t('phone')}
              value={info.phone}
              icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          )}
          {info?.email && (
            <ContactRow
              href={`mailto:${info.email}`}
              label={t('email')}
              value={info.email}
              icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          )}
        </div>
        <button
          ref={closeRef}
          onClick={onClose}
          className="mt-5 w-full rounded-2xl border border-sand-200 px-3 py-2.5 text-xs font-semibold text-sand-700 transition-colors hover:bg-sand-50"
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
}

function ContactRow({ href, label, value, icon }: { href: string; label: string; value: string; icon: string }) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      className="flex items-center gap-3 rounded-2xl border border-sand-200 px-3.5 py-3 text-start transition-colors hover:bg-sand-50"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-teal-deep)] text-white">
        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block text-2xs font-semibold text-sand-500">{label}</span>
        <span className="block truncate text-sm font-semibold text-sand-900" dir="ltr">{value}</span>
      </span>
    </a>
  );
}

export function Landing() {
  const t = useTranslations('marketing');
  const tc = useTranslations('common');
  const locale = useLocale();
  const ar = locale === 'ar';
  useReveal();

  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const phoneStageRef = useRef<HTMLDivElement>(null);
  const browserStageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        setScrolled(y > 20);
        // Progress bar across the whole page.
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (progressRef.current) progressRef.current.style.setProperty('--p', String(max > 0 ? y / max : 0));
        // Hero drifts up + fades as you scroll past it (parallax depth).
        if (heroRef.current && y < window.innerHeight) {
          heroRef.current.style.transform = `translateY(${y * 0.35}px)`;
          heroRef.current.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.85)));
        }

        // Scroll-driven 3D: an element tilts back as it sits low in the viewport
        // and rises flat as it reaches the middle — a real sense of depth.
        const vh = window.innerHeight;
        const tilt3d = (el: HTMLElement | null, maxDeg: number, lift: number) => {
          if (!el) return;
          const r = el.getBoundingClientRect();
          const center = r.top + r.height / 2;
          // -1 (well below) .. 0 (centered) .. 1 (well above)
          const p = Math.max(-1, Math.min(1, (center - vh / 2) / (vh / 2)));
          const deg = Math.max(0, p) * maxDeg; // only tilt while below center
          el.style.transform = `perspective(1600px) rotateX(${deg}deg) translateY(${Math.max(0, p) * lift}px)`;
        };
        tilt3d(phoneStageRef.current, 22, 40);
        tilt3d(browserStageRef.current, 16, 30);

      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Real plans from the dashboard — what the admin sets here is what shows here.
  const [plans, setPlans] = useState<PublicPlan[] | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  // Contact details come from the admin's settings — never written into the page.
  const [contact, setContact] = useState<ContactState>({ status: 'closed' });
  // The dialog opens on the click, not after the request: on a slow connection
  // a button that appears to do nothing gets pressed three times.
  const openContact = () => {
    setMenuOpen(false);
    setContact({ status: 'loading' });
    fetch(`${API}/discovery/support-info`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<SupportInfo>;
      })
      .then((info) => setContact({ status: 'ready', info }))
      .catch(() => setContact({ status: 'error' }));
  };
  const closeContact = useCallback(() => setContact({ status: 'closed' }), []);
  // Phones have no room for the nav links, so they fold into a menu.
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setLightbox(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    fetch(`${API}/discovery/plans`)
      .then((r) => (r.ok ? r.json() : []))
      .then((p: PublicPlan[]) => setPlans(p))
      .catch(() => setPlans([]));
  }, []);

  const patientFeatures = [
    { icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', key: 'p1' },
    { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', key: 'p2' },
    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', key: 'p3' },
    { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', key: 'p4' },
    { icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', key: 'p5' },
    { icon: 'M12 8v13m0-13V6a2 2 0 012-2h.5a.5.5 0 01.5.5V5a2 2 0 002 2h.5a.5.5 0 01.5.5V8m-6 0H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2v-9a2 2 0 00-2-2h-2', key: 'p6' },
  ];

  const doctorFeatures = [
    { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', key: 'd1' },
    { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', key: 'd2' },
    { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', key: 'd3' },
    { icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', key: 'd4' },
    { icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z', key: 'd5' },
    { icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z', key: 'd6' },
  ];

  const steps = ['s1', 's2', 's3'];

  return (
    <div className="relative overflow-hidden bg-white">
      <div ref={progressRef} className="scroll-progress" />
      {/* ── Sticky nav ── */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'nav-frost bg-white/70 shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#top" className="flex items-center gap-2">
            <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${scrolled ? 'bg-[var(--color-teal-deep)]' : 'glass'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Sinan" className="h-6 w-6 object-contain" />
            </span>
            <span className={`text-base font-extrabold tracking-tight transition-colors ${scrolled ? 'text-[var(--color-teal-deep)]' : 'text-white'}`}>
              {tc('appName')}
            </span>
          </a>
          <div className={`hidden items-center gap-6 text-sm font-semibold md:flex ${scrolled ? 'text-sand-600' : 'text-white/90'}`}>
            <a href="#patients" className="nav-link transition-colors hover:opacity-80">{t('nav.patients')}</a>
            <a href="#doctors" className="nav-link transition-colors hover:opacity-80">{t('nav.doctors')}</a>
            <a href="#packages" className="nav-link transition-colors hover:opacity-80">{t('nav.packages')}</a>
            <a href="#join" className="nav-link transition-colors hover:opacity-80">{t('nav.join')}</a>
            <button onClick={openContact} className="nav-link transition-colors hover:opacity-80">{t('nav.contact')}</button>
          </div>
          {/* Language is a link, not a detector: the visitor switches by choice. */}
          <Link
            href="/"
            locale={ar ? 'en' : 'ar'}
            lang={ar ? 'en' : 'ar'}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all hover:scale-105 active:scale-95 ${
              scrolled ? 'bg-[var(--color-teal-deep)] text-white shadow-md' : 'glass text-white'
            }`}
          >
            {ar ? 'English' : 'العربية'}
          </Link>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={t('nav.menu')}
            aria-expanded={menuOpen}
            className={`ms-2 flex h-9 w-9 items-center justify-center rounded-full md:hidden ${
              scrolled ? 'bg-[var(--color-teal-deep)] text-white' : 'glass text-white'
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'} />
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="mx-4 mb-3 rounded-2xl bg-white p-2 text-sm font-semibold text-sand-800 shadow-xl md:hidden">
            {(['patients', 'doctors', 'packages', 'join'] as const).map((key) => (
              <a
                key={key}
                href={`#${key}`}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 transition-colors hover:bg-sand-50"
              >
                {t(`nav.${key}`)}
              </a>
            ))}
            <button onClick={openContact} className="block w-full rounded-xl px-4 py-3 text-start transition-colors hover:bg-sand-50">
              {t('nav.contact')}
            </button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <header id="top" className="sinan-bg relative min-h-screen">
        <div className="orb orb-1 h-[420px] w-[420px]" style={{ background: 'rgba(127,224,210,0.4)', top: '-8%', insetInlineStart: '-6%' }} />
        <div className="orb orb-2 h-[360px] w-[360px]" style={{ background: 'rgba(11,60,66,0.45)', bottom: '-6%', insetInlineEnd: '-4%' }} />
        <div className="orb orb-3 h-[240px] w-[240px]" style={{ background: 'rgba(255,255,255,0.18)', top: '30%', insetInlineEnd: '20%' }} />

        <div ref={heroRef} className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-5 pt-28 pb-16 sm:pt-20 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="logo-breathe mb-4 h-20 w-20 object-contain sm:h-24 sm:w-24" />

          <h1 className="anim-fade-up d1 max-w-3xl text-4xl leading-tight font-black tracking-tight text-white sm:text-6xl">
            {t('hero.title')} <span className="shine-text">{t('hero.titleAccent')}</span>
          </h1>
          <p className="anim-fade-up d2 mt-5 max-w-xl text-lg leading-relaxed text-white/80">{t('hero.subtitle')}</p>

          <div className="anim-fade-up d3 mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#patients"
              className="btn-shine rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-[var(--color-teal-deep)] shadow-[0_10px_30px_rgba(8,44,49,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(8,44,49,0.45)] active:translate-y-0"
            >
              {t('hero.ctaPatient')}
            </a>
            <a
              href="#join"
              className="glass rounded-2xl px-7 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
            >
              {t('hero.ctaDoctor')}
            </a>
          </div>

          {/* Live stat strip */}
          <div className="anim-fade-up d4 mt-10 grid w-full max-w-2xl grid-cols-3 gap-3 sm:mt-14 sm:gap-4">
            {(
              [
                [6, '+', 'stat1'],
                [24, '/7', 'stat2'],
                [100, '%', 'stat3'],
              ] as const
            ).map(([n, suf, key]) => (
              <div key={key} className="glass rounded-2xl px-3 py-4">
                <div className="text-2xl font-black text-white sm:text-3xl">
                  <CountUp to={n} suffix={suf} />
                </div>
                <div className="mt-1 text-2xs text-white/70">{t(`hero.${key}`)}</div>
              </div>
            ))}
          </div>

          <a href="#about" className="scroll-hint mt-10 text-white/60 sm:mt-14" aria-label={t('hero.scroll')}>
            <svg className="mx-auto h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </header>

      {/* ── About ── */}
      <section id="about" className="mx-auto max-w-4xl px-5 py-24 text-center">
        <span className="reveal text-xs font-bold tracking-widest text-[var(--color-teal-mid)] uppercase">{t('about.eyebrow')}</span>
        <h2 className="reveal d1 mt-3 text-3xl font-black tracking-tight text-sand-900 sm:text-4xl">
          {t('about.title')} <span className="gradient-text">{t('about.titleAccent')}</span>
        </h2>
        <p className="reveal d2 mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-sand-500">{t('about.body')}</p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {['v1', 'v2', 'v3'].map((k, i) => (
            <div key={k} className={`reveal-pop d${i + 1} tilt rounded-3xl border border-sand-100 bg-white p-6 text-start shadow-sm`}>
              <div
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                style={{ background: 'linear-gradient(135deg, var(--color-teal-deep), var(--color-teal-soft))' }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={
                      [
                        'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                        'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
                        'M13 10V3L4 14h7v7l9-11h-7z',
                      ][i]
                    }
                  />
                </svg>
              </div>
              <div className="text-base font-bold text-sand-900">{t(`about.${k}Title`)}</div>
              <p className="mt-1 text-sm leading-relaxed text-sand-500">{t(`about.${k}Body`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── For patients ── */}
      <section id="patients" className="relative overflow-hidden bg-sand-50 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-14 text-center">
            <span className="reveal inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-[var(--color-teal-deep)]">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t('patients.eyebrow')}
            </span>
            <h2 className="reveal d1 mt-4 text-3xl font-black tracking-tight text-sand-900 sm:text-4xl">{t('patients.title')}</h2>
            <p className="reveal d2 mx-auto mt-4 max-w-xl text-lg text-sand-500">{t('patients.subtitle')}</p>
          </div>

          {/* Phone screenshots — a floating trio. Drop your PNGs in public/screenshots/. */}
          <div ref={phoneStageRef} className="mb-16 flex items-end justify-center will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
            <div className="reveal-left hidden sm:block">
              <div className="-me-8 opacity-90" style={{ transform: 'scale(0.82) rotate(-6deg)' }}>
                <Phone src="/screenshots/app-2.png" className="bob-slow" onClick={() => setLightbox('/screenshots/app-2.png')} />
              </div>
            </div>
            <div className="reveal-pop z-10">
              <Phone src="/screenshots/app-1.png" className="bob" onClick={() => setLightbox('/screenshots/app-1.png')} />
            </div>
            <div className="reveal-right hidden sm:block">
              <div className="-ms-8 opacity-90" style={{ transform: 'scale(0.82) rotate(6deg)' }}>
                <Phone src="/screenshots/app-3.png" className="bob-slow" onClick={() => setLightbox('/screenshots/app-3.png')} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {patientFeatures.map((f, i) => (
              <div key={f.key} className={`reveal-pop d${(i % 3) + 1} tilt group rounded-3xl border border-sand-100 bg-white p-6 shadow-sm`}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-[var(--color-teal-deep)] transition-transform group-hover:scale-110">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <div className="text-base font-bold text-sand-900">{t(`patients.${f.key}Title`)}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-sand-500">{t(`patients.${f.key}Body`)}</p>
              </div>
            ))}
          </div>

          <div className="reveal mt-12 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-2xl bg-sand-900 px-5 py-3 text-sm font-bold text-white/90 opacity-70">{t('patients.iosSoon')}</span>
            <span className="rounded-2xl bg-sand-900 px-5 py-3 text-sm font-bold text-white/90 opacity-70">{t('patients.androidSoon')}</span>
          </div>
        </div>
      </section>

      {/* ── For doctors ── */}
      <section id="doctors" className="sinan-bg relative overflow-hidden py-24">
        <div className="relative z-10 mx-auto max-w-6xl px-5">
          <div className="mb-14 text-center">
            <span className="reveal inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-bold text-white">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {t('doctors.eyebrow')}
            </span>
            <h2 className="reveal d1 mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">{t('doctors.title')}</h2>
            <p className="reveal d2 mx-auto mt-4 max-w-xl text-lg text-white/80">{t('doctors.subtitle')}</p>
          </div>

          {/* Dashboard screenshot — drop your PNG in public/screenshots/dash-1.png */}
          <div ref={browserStageRef} className="reveal-pop mx-auto mb-16 max-w-3xl cursor-pointer will-change-transform" style={{ transformStyle: 'preserve-3d' }} role="button" tabIndex={0} onClick={() => setLightbox('/screenshots/dash-1.png')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setLightbox('/screenshots/dash-1.png'))}>
            <Browser src="/screenshots/dash-1.png" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {doctorFeatures.map((f, i) => (
              <div key={f.key} className={`reveal-pop d${(i % 3) + 1} glass rounded-3xl p-6 transition-transform hover:-translate-y-1`}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <div className="text-base font-bold text-white">{t(`doctors.${f.key}Title`)}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-white/75">{t(`doctors.${f.key}Body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-5xl px-5 py-24">
        <h2 className="reveal text-center text-3xl font-black tracking-tight text-sand-900 sm:text-4xl">{t('how.title')}</h2>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s} className={`reveal d${i + 1} relative text-center`}>
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--color-teal-deep), var(--color-teal-soft))' }}
              >
                {i + 1}
              </div>
              {i < 2 && <div className="absolute top-8 hidden h-0.5 w-full bg-gradient-to-r from-teal-200 to-transparent md:block" style={{ insetInlineStart: '60%' }} />}
              <div className="mt-4 text-base font-bold text-sand-900">{t(`how.${s}Title`)}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-sand-500">{t(`how.${s}Body`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Packages ── */}
      <section id="packages" className="bg-sand-50 py-24">
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-14 text-center">
            <span className="reveal text-xs font-bold tracking-widest text-[var(--color-teal-mid)] uppercase">{t('packages.eyebrow')}</span>
            <h2 className="reveal d1 mt-3 text-3xl font-black tracking-tight text-sand-900 sm:text-4xl">{t('packages.title')}</h2>
            <p className="reveal d2 mx-auto mt-4 max-w-xl text-lg text-sand-500">{t('packages.subtitle')}</p>
          </div>

          <div className={`grid items-stretch gap-5 ${plans && plans.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 md:mx-auto md:max-w-2xl'}`}>
            {(plans ?? []).map((plan, i) => {
              const featured = plans!.length > 1 && plan.features.length === Math.max(...plans!.map((p) => p.features.length)) && i === plans!.map((p) => p.features.length).lastIndexOf(Math.max(...plans!.map((p) => p.features.length)));
              const lines = [t('packages.baseCalendar'), t('packages.baseRecords'), ...plan.features.map((f) => (t.has(`packages.feat.${f}`) ? t(`packages.feat.${f}`) : f))];
              return (
                <div
                  key={plan.id}
                  className={`anim-scale-in d${i + 1} relative flex flex-col rounded-3xl p-7 shadow-sm ${
                    featured ? 'text-white shadow-2xl md:-mt-4 md:mb-4' : 'border border-sand-100 bg-white'
                  }`}
                  style={featured ? { background: 'linear-gradient(160deg, var(--color-teal-deep), var(--color-teal-mid) 60%, var(--color-teal-soft))' } : undefined}
                >
                  {featured && (
                    <span className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-2xs font-black text-amber-950 rtl:translate-x-1/2">
                      {t('packages.popular')}
                    </span>
                  )}
                  <div className={`text-sm font-black uppercase tracking-wide ${featured ? 'text-white/80' : 'text-[var(--color-teal-deep)]'}`}>
                    {plan.name}
                  </div>
                  <div className="mt-3 flex items-end gap-1">
                    <span className={`text-4xl font-black ${featured ? 'text-white' : 'text-sand-900'}`}>${plan.priceUsd}</span>
                    <span className={`pb-1.5 text-sm ${featured ? 'text-white/70' : 'text-sand-400'}`}>
                      /{plan.billingCycle === 'MONTHLY' ? t('packages.mo') : t('packages.yr')}
                    </span>
                  </div>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {lines.map((line) => (
                      <li key={line} className="flex items-start gap-2 text-sm">
                        <svg className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? 'text-emerald-300' : 'text-[var(--color-teal-mid)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={featured ? 'text-white/90' : 'text-sand-600'}>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#join"
                    className={`mt-6 rounded-2xl py-3 text-center text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 ${
                      featured ? 'bg-white text-[var(--color-teal-deep)]' : 'bg-[var(--color-teal-deep)] text-white'
                    }`}
                  >
                    {t('packages.cta')}
                  </a>
                </div>
              );
            })}
            {plans === null &&
              [0, 1].map((i) => <div key={i} className="h-96 animate-pulse rounded-3xl bg-sand-100" />)}
            {plans !== null && plans.length === 0 && (
              <div className="col-span-full rounded-3xl border border-sand-100 bg-white p-10 text-center text-sand-400">
                {t('packages.none')}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Join (doctor lead form) ── */}
      <section id="join" className="sinan-bg relative overflow-hidden py-24">
        <div className="orb orb-1 h-[300px] w-[300px]" style={{ background: 'rgba(127,224,210,0.3)', top: '10%', insetInlineEnd: '5%' }} />
        <div className="relative z-10 mx-auto grid max-w-5xl items-center gap-12 px-5 lg:grid-cols-2">
          <div className="reveal">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{t('join.title')}</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/80">{t('join.subtitle')}</p>
            <ul className="mt-6 space-y-3">
              {['j1', 'j2', 'j3'].map((k) => (
                <li key={k} className="flex items-center gap-3 text-white/90">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium">{t(`join.${k}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal-pop d1">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* Tap-to-enlarge lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            autoFocus
            onClick={() => setLightbox(null)}
            className="absolute end-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label={t('contact.close')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="lb-card max-h-[88vh] w-auto rounded-3xl shadow-2xl"
          />
        </div>
      )}

      {contact.status !== 'closed' && <ContactDialog state={contact} onRetry={openContact} onClose={closeContact} />}

      {/* ── Footer ── */}
      <footer className="bg-sand-950 py-12 text-center text-white/60">
        <div className="mx-auto max-w-5xl px-5">
          <div className="flex items-center justify-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Sinan" className="h-7 w-7 object-contain" />
            <span className="text-lg font-extrabold text-white">{tc('appName')}</span>
          </div>
          <p className="mt-3 text-sm">{t('footer.tagline')}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/privacy" className="transition-colors hover:text-white">{t('footer.privacy')}</Link>
            <Link href="/terms" className="transition-colors hover:text-white">{t('footer.terms')}</Link>
            <button onClick={openContact} className="transition-colors hover:text-white">{t('nav.contact')}</button>
          </div>
          <p className="mt-6 text-2xs text-white/40">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}

/**
 * A phone number the way people actually type it → the +digits form the API
 * stores. "03 123 456", "+961 3 123456" and "00961-3-123456" are one number.
 */
function normalizePhone(raw: string): string {
  let v = raw.replace(/[\s\-().]/g, '');
  if (v.startsWith('00')) v = `+${v.slice(2)}`;
  // A local Lebanese number: drop the trunk zero, add the country code.
  else if (/^0\d{7,8}$/.test(v)) v = `+961${v.slice(1)}`;
  else if (/^\d{7,8}$/.test(v)) v = `+961${v}`;
  return v;
}

/**
 * Nobody fills four fields in less than this. A script does — it posts the
 * moment the page arrives — so a form sent sooner is held back until this
 * much time has passed since it was first drawn.
 */
const MIN_FILL_MS = 3000;

/**
 * The doctor lead form — posts to the public /discovery/leads endpoint.
 *
 * It is the one thing on this site anyone can write to, with no sign-in, so it
 * is what a bot finds. Two quiet defences here, beside the API's own limit per
 * address:
 *
 *   the `website` field   a field no person sees (hidden by CSS, out of the tab
 *                         order, off for autofill and screen readers) and so
 *                         no person fills. Bots fill every field they find.
 *                         It is sent as it is: the API answers "ok" to a
 *                         filled one and stores nothing, so the bot learns
 *                         nothing from being caught.
 *   the minimum time      see MIN_FILL_MS. A fast human is not told off —
 *                         the button simply stays busy for the remainder.
 *
 * Neither is a wall, and neither is meant to be: they cost a real doctor
 * nothing, and they turn away the scripts that do not look.
 */
function LeadForm() {
  const t = useTranslations('marketing');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+961');
  const [clinicName, setClinicName] = useState('');
  const [area, setArea] = useState('');
  const [website, setWebsite] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  // When the form was first on screen. Set in an effect, not while rendering:
  // the server renders this too, and its clock is not the visitor's.
  const shownAt = useRef<number | null>(null);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);
  // What stops a second send. `busy` only greys the button: it is state, read
  // as it was when the form was last drawn, so two submits in the same instant
  // both saw "not busy" and both went out. A ref is read as it is now.
  const sending = useRef(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending.current) return;

    // The button is never greyed out with no explanation: a press that cannot
    // go through says which field is wrong.
    const number = normalizePhone(phone);
    if (fullName.trim().length < 2) return setError(t('join.errName'));
    if (!/^\+[1-9]\d{7,14}$/.test(number)) return setError(t('join.errPhone'));
    if (clinicName.trim().length < 2) return setError(t('join.errClinic'));

    sending.current = true;
    setBusy(true);
    setError(null);
    try {
      // Too soon to have been typed: wait out the rest, saying nothing.
      const tooSoon = MIN_FILL_MS - (Date.now() - (shownAt.current ?? Date.now()));
      if (tooSoon > 0) await new Promise((done) => setTimeout(done, tooSoon));

      const res = await fetch(`${API}/discovery/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Exactly the fields the API takes — it refuses a body with any other.
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: number,
          clinicName: clinicName.trim(),
          ...(area.trim() ? { governorate: area.trim() } : {}),
          website,
        }),
      });
      // Nothing in the answer is used, but it is read to its end: a response
      // left unread stays open in the browser until the page is left, and is
      // then counted as a request that failed.
      await res.text().catch(() => '');
      // 409: this number already asked a few minutes ago — say so, kindly.
      if (res.status === 409) return setError(t('join.already'));
      // 429: too many from this address. The API says how long; "a few
      // minutes" is as exact as a visitor needs.
      if (res.status === 429) return setError(t('join.tooMany'));
      if (!res.ok) return setError(t('join.failed'));
      setSent(true);
    } catch {
      setError(t('join.failed'));
    } finally {
      sending.current = false;
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400 text-white">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-xl font-black text-white">{t('join.sentTitle')}</div>
        <p className="mt-2 text-sm text-white/80">{t('join.sentBody')}</p>
      </div>
    );
  }

  const field = 'w-full rounded-xl border border-white/25 bg-white/12 px-4 py-3 text-sm text-white placeholder-white/45 outline-none transition-all focus:border-white/70 focus:bg-white/20';

  return (
    <form onSubmit={(e) => void submit(e)} noValidate className="glass rounded-3xl p-7">
      <div className="mb-4 text-lg font-black text-white">{t('join.formTitle')}</div>
      {error && <div role="alert" className="mb-3 rounded-xl bg-red-500/25 px-3 py-2 text-xs text-white">{error}</div>}
      <div className="space-y-3">
        <label className="block">
          <span className="sr-only">{t('join.name')}</span>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('join.name')} autoComplete="name" maxLength={120} className={field} />
        </label>
        <label className="block">
          <span className="sr-only">{t('join.phone')}</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" type="tel" inputMode="tel" autoComplete="tel" placeholder="+961 3 123456" maxLength={24} className={field} />
        </label>
        <label className="block">
          <span className="sr-only">{t('join.clinic')}</span>
          <input value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder={t('join.clinic')} autoComplete="organization" maxLength={160} className={field} />
        </label>
        <label className="block">
          <span className="sr-only">{t('join.area')}</span>
          <input value={area} onChange={(e) => setArea(e.target.value)} placeholder={t('join.area')} maxLength={40} className={field} />
        </label>
        {/* The field for bots — see above. Hidden with a class and not with
            `display: none` or type="hidden", which the better scripts skip. */}
        <div className="sr-only" aria-hidden="true">
          <input name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" maxLength={200} />
        </div>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="btn-shine mt-5 w-full rounded-2xl bg-white py-3.5 text-sm font-bold text-[var(--color-teal-deep)] shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0"
      >
        {busy ? '…' : t('join.send')}
      </button>
      <p className="mt-3 text-center text-2xs text-white/50">{t('join.formNote')}</p>
    </form>
  );
}
