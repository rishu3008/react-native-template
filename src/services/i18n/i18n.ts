import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager, NativeModules, Platform } from 'react-native';

import { logger } from '@services/logging';

import { ar } from './locales/ar';
import { en } from './locales/en';
import { directionFor, type SupportedLocale } from './types';

const FALLBACK: SupportedLocale = 'en';

/**
 * The device's preferred language, as a locale this app supports.
 *
 * Read from the platform rather than a library: the value is a single native
 * setting, and pulling in a localisation package to read one string is not a
 * trade worth making (rule 4).
 */
export const detectDeviceLocale = (): SupportedLocale => {
  const raw =
    Platform.OS === 'ios'
      ? (NativeModules.SettingsManager?.settings?.AppleLocale ??
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0])
      : NativeModules.I18nManager?.localeIdentifier;

  if (typeof raw !== 'string') {
    return FALLBACK;
  }

  // "en_GB" and "ar-SA" both reduce to their base language.
  const language = raw.replace('_', '-').split('-')[0]?.toLowerCase();

  return language === 'ar' ? 'ar' : FALLBACK;
};

export const initI18n = (locale: SupportedLocale = detectDeviceLocale()) => {
  if (!i18next.isInitialized) {
    void i18next.use(initReactI18next).init({
      resources: {
        en: { translation: en },
        ar: { translation: ar },
      },
      lng: locale,
      fallbackLng: FALLBACK,
      interpolation: {
        // React already escapes rendered values; escaping again produces
        // visible &amp; in the UI.
        escapeValue: false,
      },
      returnNull: false,
    });
  }

  applyDirection(locale);

  return i18next;
};

/**
 * Align the native layout direction with the locale.
 *
 * Changing this takes effect only after a restart, which is a platform
 * constraint rather than a bug: React Native reads the direction when the
 * view hierarchy is created. Callers switching locale at runtime must prompt
 * for a restart, so the flag is set here and the decision left to them.
 */
export const applyDirection = (locale: SupportedLocale): boolean => {
  const shouldBeRTL = directionFor(locale) === 'rtl';

  if (I18nManager.isRTL === shouldBeRTL) {
    return false;
  }

  try {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    return true;
  } catch (error) {
    logger.warn('Could not change layout direction', { locale, error });
    return false;
  }
};

export const changeLocale = async (
  locale: SupportedLocale,
): Promise<boolean> => {
  await i18next.changeLanguage(locale);
  return applyDirection(locale);
};

export { i18next };
