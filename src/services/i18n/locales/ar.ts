import type { TranslationSchema } from './en';

/**
 * Arabic, included solely to exercise RTL (AGENTS.md 29).
 *
 * The template ships no product copy. This exists so a right-to-left locale
 * can actually be selected and the layout verified -- an RTL-safe
 * architecture that has never rendered RTL is an untested claim.
 */
export const ar: TranslationSchema = {
  common: {
    retry: 'حاول مرة أخرى',
    cancel: 'إلغاء',
    close: 'إغلاق',
    done: 'تم',
    loading: 'جارٍ التحميل',
    offline: 'لا يوجد اتصال بالإنترنت',
  },
  errors: {
    generic: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    network: 'لا يوجد اتصال. تحقق من الشبكة وحاول مرة أخرى.',
    notFound: 'لم نتمكن من العثور على ما تبحث عنه.',
  },
  auth: {
    signIn: 'تسجيل الدخول',
    signOut: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
  },
};
