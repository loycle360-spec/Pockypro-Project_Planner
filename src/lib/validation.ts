import type { IssueDraft, MilestoneDraft, NoteDraft, ProjectDraft, RiskDraft, StakeholderDraft, TaskDraft } from '@/src/types/project';
export function validateProject(draft: ProjectDraft): string | null {
  if (!draft.name.trim()) return 'Enter a project name.';
  if (draft.name.trim().length > 120) return 'Project name must be 120 characters or fewer.';
  if (draft.startDate && draft.targetDate && draft.targetDate < draft.startDate) return 'Target date cannot be before the start date.';
  return null;
}

export function validateTask(draft: TaskDraft): string | null {
  if (!draft.title.trim()) return 'Enter a task title.';
  return null;
}

export function validateMilestone(draft: MilestoneDraft): string | null {
  if (!draft.name.trim()) return 'Enter a milestone name.';
  return null;
}

export function validateRisk(draft: RiskDraft): string | null {
  if (!draft.risk.trim()) return 'Describe the risk.';
  if (draft.probability < 1 || draft.probability > 5) return 'Probability must be between 1 and 5.';
  if (draft.impact < 1 || draft.impact > 5) return 'Impact must be between 1 and 5.';
  return null;
}

export function validateIssue(draft: IssueDraft): string | null {
  if (!draft.title.trim()) return 'Enter an issue title.';
  return null;
}

export function validateStakeholder(draft: StakeholderDraft): string | null {
  if (!draft.name.trim()) return 'Enter a stakeholder name.';
  return null;
}

export function validateNote(draft: NoteDraft): string | null {
  if (!draft.body.trim()) return 'Enter a note.';
  return null;
}
