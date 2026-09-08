import { calculateProjectHealth } from '@/src/lib/project-health';
import { validateProject } from '@/src/lib/validation';
import type { ProjectDraft } from '@/src/types/project';
const draft: ProjectDraft = { name: 'Launch', description: '', purpose: '', problem: '', objectives: '', successCriteria: '', sponsor: '', projectManager: '', startDate: '2026-01-01', targetDate: '2026-02-01', methodology: 'Hybrid', status: 'Planning', priority: 'Medium' };
describe('project health', () => { it('is healthy without risk signals', () => expect(calculateProjectHealth({ overdueTasks: 0, delayedMilestones: 0, criticalRisks: 0, highPriorityIssues: 0 }).health).toBe('Healthy')); it('is critical with a critical risk', () => expect(calculateProjectHealth({ overdueTasks: 0, delayedMilestones: 0, criticalRisks: 1, highPriorityIssues: 0 }).health).toBe('Critical')); });
describe('project validation', () => { it('rejects invalid dates', () => expect(validateProject({ ...draft, targetDate: '2025-12-31' })).toMatch(/before/)); it('accepts valid draft', () => expect(validateProject(draft)).toBeNull()); });
