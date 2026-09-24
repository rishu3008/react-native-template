export type SupportedLocale = 'en' | 'ar';

export type LocaleDirection = 'ltr' | 'rtl';

/** Locales that read right to left. */
export const RTL_LOCALES: readonly SupportedLocale[] = ['ar'];

export const directionFor = (locale: SupportedLocale): LocaleDirection =>
  RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
