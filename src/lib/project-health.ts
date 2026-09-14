import type { ProjectHealth } from '@/src/types/project';
export interface HealthInput { overdueTasks: number; delayedMilestones: number; criticalRisks: number; highPriorityIssues: number; }
export const isCriticalRisk = (probability: number, impact: number) => probability >= 4 && impact >= 4;
export interface HealthResult { health: ProjectHealth; factors: string[]; }
export function calculateProjectHealth(input: HealthInput): HealthResult {
  const factors: string[] = [];
  if (input.overdueTasks) factors.push(`${input.overdueTasks} overdue task${input.overdueTasks === 1 ? '' : 's'}`);
  if (input.delayedMilestones) factors.push(`${input.delayedMilestones} delayed milestone${input.delayedMilestones === 1 ? '' : 's'}`);
  if (input.criticalRisks) factors.push(`${input.criticalRisks} unresolved critical risk${input.criticalRisks === 1 ? '' : 's'}`);
  if (input.highPriorityIssues) factors.push(`${input.highPriorityIssues} high-priority issue${input.highPriorityIssues === 1 ? '' : 's'}`);
  if (input.criticalRisks > 0 || input.delayedMilestones > 1 || input.overdueTasks > 5) return { health: 'Critical', factors };
  if (factors.length) return { health: 'At Risk', factors };
  return { health: 'Healthy', factors: ['No current schedule or delivery concerns recorded'] };
}
