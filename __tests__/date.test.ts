import { formatDate, formatDateTime, isOverdue } from '../src/utils/date';

const stamp = new Date(2026, 0, 15, 14, 30).getTime();

describe('date helpers', () => {
  it('formats a date', () => {
    expect(formatDate(stamp)).toBe('Jan 15, 2026');
  });

  it('formats a date and time', () => {
    expect(formatDateTime(stamp)).toBe('Jan 15, 2026 at 2:30 PM');
  });

  it('returns an empty string for no date', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDateTime(null)).toBe('');
  });

  it('marks past due dates as overdue', () => {
    expect(isOverdue(Date.now() - 1000, false)).toBe(true);
  });

  it('does not mark future or completed tasks as overdue', () => {
    expect(isOverdue(Date.now() + 100000, false)).toBe(false);
    expect(isOverdue(Date.now() - 1000, true)).toBe(false);
    expect(isOverdue(null, false)).toBe(false);
  });
});
