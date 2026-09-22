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
