export const todayKey = () => new Date().toISOString().slice(0, 10);
export const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : 'Not set';
export const isPast = (value: string | null, current = todayKey()) => Boolean(value && value < current);

export function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Accept ISO dates plus friendly entries such as today, tomorrow, and 03/01/2026. */
export function normalizeDateInput(value: string): string | null {
  const input = value.trim().toLowerCase();
  if (!input) return null;
  if (input === 'today') return todayKey();
  if (input === 'tomorrow') return addDays(todayKey(), 1);
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(input);
  const slash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(input);
  const year = iso ? Number(iso[1]) : slash ? Number(slash[3]) : NaN;
  const month = iso ? Number(iso[2]) : slash ? Number(slash[1]) : NaN;
  const day = iso ? Number(iso[3]) : slash ? Number(slash[2]) : NaN;
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    : null;
}
