// lib/i18n.ts
export const LOCALES = ['en', 'fa'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isValidLocale(locale: string): locale is Locale {
  return (LOCALES as readonly string[]).includes(locale);
}

export function getLocaleDirection(locale: string): 'rtl' | 'ltr' {
  return locale === 'fa' ? 'rtl' : 'ltr';
}
