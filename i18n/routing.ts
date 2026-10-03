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
});

export type Locale = (typeof routing.locales)[number];

/** Direction is a property of the locale; nothing else should decide it. */
export const localeDirection: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
};

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
