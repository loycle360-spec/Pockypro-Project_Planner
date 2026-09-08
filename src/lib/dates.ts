export const todayKey = () => new Date().toISOString().slice(0, 10);
export const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : 'Not set';
export const isPast = (value: string | null, current = todayKey()) => Boolean(value && value < current);
