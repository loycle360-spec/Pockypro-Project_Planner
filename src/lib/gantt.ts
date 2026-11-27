import { isValidDateKey } from '@/src/lib/dates';
import type { Milestone, Project, Task } from '@/src/types/project';

export type GanttKind = 'summary' | 'task' | 'milestone';
export interface GanttRow { key: string; wbs: string; name: string; kind: GanttKind; start: string | null; end: string | null; critical: boolean; projectId: string }
export interface GanttScale { startDay: number; totalDays: number }
export interface Timescale { months: { label: string; offset: number; days: number }[]; ticks: { label: string; offset: number }[] }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const dayNumber = (date: string) => Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
const dayToDate = (day: number) => new Date(day * 86400000);

// Builds an MS Project style outline: each project is a summary row (WBS "1"), its dated tasks and
// milestones are children ("1.1", "1.2" ...). Overdue open work is flagged critical (red bar).
export function buildGanttRows(projects: Project[], tasks: Task[], milestones: Milestone[], today: string): GanttRow[] {
  const rows: GanttRow[] = [];
  projects.forEach((project, i) => {
    const children: GanttRow[] = [
      ...tasks.filter((t) => t.projectId === project.id && isValidDateKey(t.dueDate)).map((t): GanttRow => ({ key: `task-${t.id}`, wbs: '', name: t.title, kind: 'task', start: t.dueDate, end: t.dueDate, critical: Boolean(t.dueDate && t.dueDate < today), projectId: project.id })),
      ...milestones.filter((m) => m.projectId === project.id && isValidDateKey(m.targetDate)).map((m): GanttRow => ({ key: `milestone-${m.id}`, wbs: '', name: m.name, kind: 'milestone', start: m.targetDate, end: m.targetDate, critical: Boolean(m.targetDate && m.targetDate < today && m.status === 'Planned'), projectId: project.id })),
    ].sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''));
    const dates = [project.startDate, project.targetDate, ...children.map((c) => c.start)].filter(isValidDateKey).sort();
    rows.push({ key: `project-${project.id}`, wbs: String(i + 1), name: project.name, kind: 'summary', start: (isValidDateKey(project.startDate) ? project.startDate : null) ?? dates[0] ?? null, end: (isValidDateKey(project.targetDate) ? project.targetDate : null) ?? dates[dates.length - 1] ?? null, critical: false, projectId: project.id });
    children.forEach((child, j) => rows.push({ ...child, wbs: `${i + 1}.${j + 1}` }));
  });
  return rows;
}

export function computeScale(rows: GanttRow[], today: string, padDays = 7): GanttScale {
  const days = [today, ...rows.flatMap((r) => [r.start, r.end])].filter((d): d is string => Boolean(d)).map(dayNumber);
  const min = Math.min(...days) - padDays;
  const max = Math.max(...days) + padDays;
  return { startDay: min, totalDays: max - min + 1 };
}

export const offsetOf = (date: string, scale: GanttScale) => dayNumber(date) - scale.startDay;

// Two-tier timescale like MS Project: months on top, week-start (Monday) day numbers below.
export function buildTimescale(scale: GanttScale): Timescale {
  const months: Timescale['months'] = [];
  const ticks: Timescale['ticks'] = [];
  for (let offset = 0; offset < scale.totalDays; offset++) {
    const date = dayToDate(scale.startDay + offset);
    const last = months[months.length - 1];
    if (!last || date.getUTCDate() === 1) months.push({ label: `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`, offset, days: 1 });
    else last.days += 1;
    if (date.getUTCDay() === 1) ticks.push({ label: String(date.getUTCDate()), offset });
  }
  return { months, ticks };
}
