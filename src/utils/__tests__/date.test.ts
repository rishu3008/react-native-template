import { formatDate, formatRelativeTime, formatTime, isSameDay } from '@utils';

const REFERENCE = new Date('2026-09-22T12:00:00Z');

describe('date utils', () => {
  it('formats a date', () => {
    expect(formatDate('2026-09-22T12:00:00Z', 'en-GB')).toMatch(/2026/);
  });

  it('returns empty string for an invalid date rather than "Invalid Date"', () => {
    // "Invalid Date" renders straight into the UI otherwise.
    expect(formatDate('not a date')).toBe('');
    expect(formatTime('not a date')).toBe('');
    expect(formatRelativeTime('not a date')).toBe('');
  });

  it('picks the largest sensible relative unit', () => {
    const threeHoursAgo = new Date(REFERENCE.getTime() - 3 * 3600 * 1000);

    // Not "180 minutes ago".
    expect(formatRelativeTime(threeHoursAgo, 'en', REFERENCE)).toMatch(/hour/);
  });

  it('handles future times', () => {
    const inTwoDays = new Date(REFERENCE.getTime() + 2 * 86400 * 1000);

    expect(formatRelativeTime(inTwoDays, 'en', REFERENCE)).toMatch(
      /in 2 days/i,
    );
  });

  it('compares calendar days, not elapsed time', () => {
    expect(isSameDay('2026-09-22T01:00:00', '2026-09-22T23:00:00')).toBe(true);
    expect(isSameDay('2026-09-22T23:00:00', '2026-09-23T01:00:00')).toBe(false);
  });

  it('treats an invalid input as not the same day', () => {
    expect(isSameDay('nope', REFERENCE)).toBe(false);
  });
});

describe('engines without Intl.RelativeTimeFormat', () => {
  // Hermes on iOS has no RelativeTimeFormat. Node does, so every other test
  // here exercises a code path that does not run on device. Removing the
  // constructor is the only way to reach the fallback from a unit test.
  const original = Intl.RelativeTimeFormat;

  beforeEach(() => {
    // @ts-expect-error -- deleting a constructor the types say is always there
    delete Intl.RelativeTimeFormat;
  });

  afterEach(() => {
    // Plain assignment is rejected: the lib.d.ts declaration is read-only.
    Object.defineProperty(Intl, 'RelativeTimeFormat', {
      configurable: true,
      value: original,
      writable: true,
    });
  });

  it('formats without throwing', () => {
    const threeHoursAgo = new Date(REFERENCE.getTime() - 3 * 3600 * 1000);

    expect(formatRelativeTime(threeHoursAgo, 'en', REFERENCE)).toBe(
      '3 hours ago',
    );
  });

  it('formats future times', () => {
    const inTwoDays = new Date(REFERENCE.getTime() + 2 * 86400 * 1000);

    expect(formatRelativeTime(inTwoDays, 'en', REFERENCE)).toBe('in 2 days');
  });

  it('singularises a unit count of one', () => {
    const anHourAgo = new Date(REFERENCE.getTime() - 3600 * 1000);

    expect(formatRelativeTime(anHourAgo, 'en', REFERENCE)).toBe('1 hour ago');
  });
});
