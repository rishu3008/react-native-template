/**
 * Date and time formatting (brief section 29).
 *
 * Built on Intl, which Hermes ships with full ICU, so the template adds no
 * date library. One formatting entry point means two screens cannot disagree
 * about what a date looks like.
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

  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  let duration = (date.getTime() - reference.getTime()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
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
