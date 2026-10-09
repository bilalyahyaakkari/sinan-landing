import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

/**
 * Arabic and English are both first-class. Arabic is the default: the pilot
 * clinic is in Tripoli and its staff work in Arabic — English is the second
 * language here, not the fallback everyone tolerates.
 */
export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  // Arabic is where a visitor lands, whatever their browser is set to — most
  // phones here run in English while their owners read Arabic. The language is
  // then theirs to switch, and the choice is remembered.
  localeDetection: false,
  // A year, not the browser session: the language someone picked should still
  // be theirs next week (proxy.ts sends "/" to it). `secure` in a production
  // build, so the cookie never travels over plain http; development runs on
  // http://localhost, where not every browser would store a Secure cookie.
  localeCookie: { maxAge: 60 * 60 * 24 * 365, secure: process.env.NODE_ENV === 'production' },
});

export type Locale = (typeof routing.locales)[number];

/** Direction is a property of the locale; nothing else should decide it. */
export const localeDirection: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
};

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
