/**
 * Base translations.
 *
 * Keys are namespaced by area, not flat: a flat file becomes unsearchable
 * once it is a few hundred entries, and `common.retry` is unambiguous in a
 * way that `retry` is not.
 */
export const en = {
  common: {
    retry: 'Try again',
    cancel: 'Cancel',
    close: 'Close',
    done: 'Done',
    loading: 'Loading',
    offline: 'No internet connection',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'No connection. Check your network and try again.',
    notFound: 'We could not find what you were looking for.',
  },
  auth: {
    signIn: 'Sign in',
    signOut: 'Sign out',
    email: 'Email',
    password: 'Password',
  },
};

/**
 * Not `as const`: literal value types would make every other locale fail to
 * assign, since "Try again" is not the same type as its translation. Keys
 * stay fully typed either way.
 */
export type TranslationSchema = typeof en;
