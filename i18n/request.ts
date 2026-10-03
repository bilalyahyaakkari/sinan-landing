import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    /**
     * Latin digits, in BOTH languages.
     *
     * This is the Lebanese convention — Eastern Arabic numerals (١٢٣) would look
     * wrong to these users, and a tooth number or a price is read the same way
     * in either language. Set once here so no call site has to remember it.
     */
    formats: {
      number: {
        default: { numberingSystem: 'latn' },
        currency: { style: 'currency', currency: 'USD', numberingSystem: 'latn' },
      },
      dateTime: {
        // Gregorian only. No Hijri calendar in v1.
        short: { day: 'numeric', month: 'short', year: 'numeric', numberingSystem: 'latn' },
        time: { hour: '2-digit', minute: '2-digit', hour12: false, numberingSystem: 'latn' },
      },
    },
  };
});
