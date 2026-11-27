import { buildGanttRows, buildTimescale, computeScale, offsetOf } from '@/src/lib/gantt';
import type { Milestone, Project, Task } from '@/src/types/project';

const project = (over: Partial<Project> = {}): Project => ({ id: 'p1', name: 'Boiler', description: '', purpose: '', problem: '', objectives: '', successCriteria: '', sponsor: '', projectManager: '', startDate: '2026-03-01', targetDate: '2026-03-31', methodology: 'Hybrid', status: 'In Progress', priority: 'Medium', health: 'Healthy', createdAt: '', updatedAt: '', archived: false, ...over });
const task = (over: Partial<Task> = {}): Task => ({ id: 't1', projectId: 'p1', title: 'Install', status: 'To Do', dueDate: '2026-03-10', completedAt: null, ...over });
const milestone = (over: Partial<Milestone> = {}): Milestone => ({ id: 'm1', projectId: 'p1', name: 'Handover', targetDate: '2026-03-20', status: 'Planned', ...over });

describe('gantt rows', () => {
  it('builds an outline with a summary row and numbered children in date order', () => {
    const rows = buildGanttRows([project()], [task()], [milestone()], '2026-03-05');
    expect(rows.map((r) => [r.wbs, r.kind])).toEqual([['1', 'summary'], ['1.1', 'task'], ['1.2', 'milestone']]);
  });
  it('flags overdue open work as critical', () => {
    const rows = buildGanttRows([project()], [task({ dueDate: '2026-03-02' })], [], '2026-03-05');
    expect(rows[1]?.critical).toBe(true);
  });
  it('does not flag future work as critical', () => {
    expect(buildGanttRows([project()], [task()], [], "2026-03-05")[1]?.critical).toBe(false);
  });
  it('derives summary dates from children when the project has none', () => {
    const rows = buildGanttRows([project({ startDate: null, targetDate: null })], [task()], [milestone()], '2026-03-05');
    expect([rows[0]?.start, rows[0]?.end]).toEqual(['2026-03-10', '2026-03-20']);
  });
  it('skips invalid stored dates so the schedule remains usable', () => {
    const rows = buildGanttRows([project({ startDate: 'bad', targetDate: null })], [task({ dueDate: 'tomorrow' })], [], '2026-03-05');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.start).toBeNull();
    expect(computeScale(rows, '2026-03-05').totalDays).toBe(15);
  });
  it('skips undated tasks', () => {
    expect(buildGanttRows([project()], [task({ dueDate: null })], [], '2026-03-05')).toHaveLength(1);
  });
});

describe('gantt scale', () => {
  it('pads the range and offsets dates from the start', () => {
    const rows = buildGanttRows([project()], [], [], '2026-03-05');
    const scale = computeScale(rows, '2026-03-05', 7);
    expect(offsetOf('2026-03-01', scale)).toBe(7);
    expect(scale.totalDays).toBe(31 + 14);
  });
  it('builds a month tier and Monday week ticks', () => {
    const scale = computeScale(buildGanttRows([project()], [], [], '2026-03-05'), '2026-03-05', 7);
    const { months, ticks } = buildTimescale(scale);
    expect(months.map((m) => m.label)).toEqual(['Feb 2026', 'Mar 2026', 'Apr 2026']);
    expect(months.reduce((n, m) => n + m.days, 0)).toBe(scale.totalDays);
    expect(ticks.length).toBeGreaterThan(4);
  });
});
