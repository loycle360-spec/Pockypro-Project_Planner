import type { ProjectDraft } from '@/src/types/project';
export function validateProject(draft: ProjectDraft): string | null {
  if (!draft.name.trim()) return 'Enter a project name.';
  if (draft.name.trim().length > 120) return 'Project name must be 120 characters or fewer.';
  if (draft.startDate && draft.targetDate && draft.targetDate < draft.startDate) return 'Target date cannot be before the start date.';
  return null;
}
