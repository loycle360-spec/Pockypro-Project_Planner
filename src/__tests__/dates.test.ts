import { formatDate, isPast, isValidDateKey, todayKey } from '@/src/lib/dates';
import { validateMilestone, validateTask } from '@/src/lib/validation';

describe('calendar dates', () => {
  it('uses the device calendar day', () => {
    const localDate = new Date(2026, 0, 1, 0, 30);
    expect(todayKey(localDate)).toBe('2026-01-01');
  });

  it('validates real calendar dates and leap years', () => {
    expect(isValidDateKey('2024-02-29')).toBe(true);
    expect(isValidDateKey('2025-02-29')).toBe(false);
    expect(isValidDateKey('2026-2-01')).toBe(false);
    expect(isValidDateKey('2026-13-01')).toBe(false);
  });

  it('rejects invalid task and milestone dates', () => {
    expect(validateTask({ title: 'Task', dueDate: 'tomorrow' })).toMatch(/valid due date/);
    expect(validateMilestone({ name: 'Launch', targetDate: '2026-04-31' })).toMatch(/valid target date/);
  });

  it('handles invalid dates already stored on a device', () => {
    expect(formatDate('bad date')).toBe('Invalid date');
    expect(isPast('bad date', '2026-01-01')).toBe(false);
  });
});
