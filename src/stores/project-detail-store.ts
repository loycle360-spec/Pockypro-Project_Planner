import { create } from 'zustand';
import { projectRepository } from '@/src/db/project-repository';
import { taskRepository } from '@/src/db/task-repository';
import { milestoneRepository } from '@/src/db/milestone-repository';
import { riskRepository } from '@/src/db/risk-repository';
import { issueRepository } from '@/src/db/issue-repository';
import { stakeholderRepository } from '@/src/db/stakeholder-repository';
import { noteRepository } from '@/src/db/note-repository';
import type { Issue, IssueDraft, IssueStatus, Milestone, MilestoneDraft, MilestoneStatus, Note, NoteDraft, Project, Risk, RiskDraft, RiskStatus, Stakeholder, StakeholderDraft, Task, TaskDraft, TaskStatus } from '@/src/types/project';

type State = {
  project: Project | null; tasks: Task[]; milestones: Milestone[]; risks: Risk[]; issues: Issue[]; stakeholders: Stakeholder[]; notes: Note[];
  loading: boolean; error: string | null;
  load: (projectId: string) => Promise<void>;
  addTask: (draft: TaskDraft) => Promise<void>;
  setTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  addMilestone: (draft: MilestoneDraft) => Promise<void>;
  setMilestoneStatus: (milestoneId: string, status: MilestoneStatus) => Promise<void>;
  addRisk: (draft: RiskDraft) => Promise<void>;
  setRiskStatus: (riskId: string, status: RiskStatus) => Promise<void>;
  addIssue: (draft: IssueDraft) => Promise<void>;
  setIssueStatus: (issueId: string, status: IssueStatus) => Promise<void>;
  addStakeholder: (draft: StakeholderDraft) => Promise<void>;
  addNote: (draft: NoteDraft) => Promise<void>;
};

export const useProjectDetailStore = create<State>((set, get) => {
  const refresh = async (projectId: string) => {
    await projectRepository.recalculateHealth(projectId);
    const [project, tasks, milestones, risks, issues, stakeholders, notes] = await Promise.all([
      projectRepository.get(projectId),
      taskRepository.list(projectId),
      milestoneRepository.list(projectId),
      riskRepository.list(projectId),
      issueRepository.list(projectId),
      stakeholderRepository.list(projectId),
      noteRepository.list(projectId),
    ]);
    set({ project, tasks, milestones, risks, issues, stakeholders, notes });
  };

  const runMutation = async (mutate: () => Promise<unknown>, failureMessage: string) => {
    const projectId = get().project?.id;
    if (!projectId) return;
    try { await mutate(); await refresh(projectId); }
    catch { set({ error: failureMessage }); }
  };

  return {
    project: null, tasks: [], milestones: [], risks: [], issues: [], stakeholders: [], notes: [], loading: false, error: null,

    load: async (projectId) => { set({ loading: true, error: null }); try { await refresh(projectId); } catch { set({ error: 'Unable to load this project. Your data remains safely stored on this device.' }); } finally { set({ loading: false }); } },

    addTask: (draft) => runMutation(() => taskRepository.create(get().project!.id, draft), 'Unable to save this task.'),
    setTaskStatus: (taskId, status) => runMutation(() => taskRepository.setStatus(taskId, status), 'Unable to update this task.'),

    addMilestone: (draft) => runMutation(() => milestoneRepository.create(get().project!.id, draft), 'Unable to save this milestone.'),
    setMilestoneStatus: (milestoneId, status) => runMutation(() => milestoneRepository.setStatus(milestoneId, status), 'Unable to update this milestone.'),

    addRisk: (draft) => runMutation(() => riskRepository.create(get().project!.id, draft), 'Unable to save this risk.'),
    setRiskStatus: (riskId, status) => runMutation(() => riskRepository.setStatus(riskId, status), 'Unable to update this risk.'),

    addIssue: (draft) => runMutation(() => issueRepository.create(get().project!.id, draft), 'Unable to save this issue.'),
    setIssueStatus: (issueId, status) => runMutation(() => issueRepository.setStatus(issueId, status), 'Unable to update this issue.'),

    addStakeholder: (draft) => runMutation(() => stakeholderRepository.create(get().project!.id, draft), 'Unable to save this stakeholder.'),
    addNote: (draft) => runMutation(() => noteRepository.create(get().project!.id, draft), 'Unable to save this note.'),
  };
});
