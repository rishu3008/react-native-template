/**
 * Date and time formatting (brief section 29).
 *
 * Built on Intl, so the template adds no date library. One formatting entry
 * point means two screens cannot disagree about what a date looks like.
 *
 * Hermes does not bundle ICU; it implements Intl against whatever the host
 * platform exposes. That covers DateTimeFormat and NumberFormat everywhere,
 * but RelativeTimeFormat is missing on iOS -- see relativeFormatter below.
 *
 * Every function takes an explicit locale rather than reading a global, so
 * output is deterministic and testable.
 */
export type DateInput = Date | string | number;

const toDate = (value: DateInput): Date | null => {
  const date = value instanceof Date ? value : new Date(value);

  // An invalid date formats as "Invalid Date" and silently ships to users.
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (
  value: DateInput,
  locale = 'en',
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string => {
  const date = toDate(value);
  return date == null
    ? ''
    : new Intl.DateTimeFormat(locale, options).format(date);
};

export const formatTime = (
  value: DateInput,
  locale = 'en',
  options: Intl.DateTimeFormatOptions = { timeStyle: 'short' },
): string => {
  const date = toDate(value);
  return date == null
    ? ''
    : new Intl.DateTimeFormat(locale, options).format(date);
};

export const formatDateTime = (value: DateInput, locale = 'en'): string =>
  formatDate(value, locale, { dateStyle: 'medium', timeStyle: 'short' });

const DIVISIONS: readonly {
  amount: number;
  unit: Intl.RelativeTimeFormatUnit;
}[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
];

/**
 * Intl.RelativeTimeFormat where the engine has it, plain English where it
 * does not.
 *
 * Hermes on iOS implements Intl on top of Foundation, which offers no
 * equivalent of RelativeTimeFormat, so the constructor is undefined there and
 * calling it throws "undefined cannot be used as a constructor". Node has it,
 * which is why a unit test cannot catch this and only a device can.
 *
 * The fallback is deliberately unlocalised rather than silently wrong: it
 * always reads as English, so a missing translation is visible instead of
 * looking like a bad one. A project that needs localised relative times on
 * iOS should add @formatjs/intl-relativetimeformat, which this then uses
 * automatically.
 */
const relativeFormatter = (
  locale: string,
): ((value: number, unit: Intl.RelativeTimeFormatUnit) => string) => {
  if (typeof Intl.RelativeTimeFormat === 'function') {
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    return (value, unit) => formatter.format(value, unit);
  }

  return (value, unit) => {
    const count = Math.abs(value);
    const plural = count === 1 ? unit : `${unit}s`;

    return value < 0 ? `${count} ${plural} ago` : `in ${count} ${plural}`;
  };
};

/**
 * "3 hours ago", "in 2 days".
 *
 * Walks up the unit scale rather than hardcoding thresholds, so the largest
 * sensible unit is always chosen and the caller never sees "90 minutes ago".
 */
export const formatRelativeTime = (
  value: DateInput,
  locale = 'en',
  now: DateInput = Date.now(),
): string => {
  const date = toDate(value);
  const reference = toDate(now);

  if (date == null || reference == null) {
    return '';
  }

  const formatter = relativeFormatter(locale);
  let duration = (date.getTime() - reference.getTime()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter(Math.round(duration), division.unit);
    }

    duration /= division.amount;
  }

  return '';
};

/** True when the value falls on the same calendar day as the reference. */
export const isSameDay = (a: DateInput, b: DateInput): boolean => {
  const first = toDate(a);
  const second = toDate(b);

  if (first == null || second == null) {
    return false;
  }

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};
