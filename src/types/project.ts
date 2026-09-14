export type ProjectStatus = 'Not Started' | 'Planning' | 'In Progress' | 'On Hold' | 'At Risk' | 'Completed' | 'Cancelled';
export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ProjectHealth = 'Healthy' | 'At Risk' | 'Critical';
export type Methodology = 'Predictive' | 'Agile' | 'Hybrid' | 'Custom';

export interface Project {
  id: string; name: string; description: string; purpose: string; problem: string;
  objectives: string; successCriteria: string; sponsor: string; projectManager: string;
  startDate: string | null; targetDate: string | null; methodology: Methodology;
  status: ProjectStatus; priority: ProjectPriority; health: ProjectHealth;
  archived: boolean; createdAt: string; updatedAt: string;
}

export type ProjectDraft = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archived' | 'health'>;

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export interface Task { id: string; projectId: string; title: string; status: TaskStatus; dueDate: string | null; completedAt: string | null; }
export type TaskDraft = { title: string; dueDate: string | null };
export interface TaskWithProject extends Task { projectName: string; }

export type MilestoneStatus = 'Planned' | 'Achieved' | 'Missed';
export interface Milestone { id: string; projectId: string; name: string; targetDate: string | null; status: MilestoneStatus; }
export type MilestoneDraft = { name: string; targetDate: string | null };
export interface MilestoneWithProject extends Milestone { projectName: string; }

export type RiskStatus = 'Open' | 'Mitigated' | 'Closed';
export interface Risk { id: string; projectId: string; risk: string; probability: number; impact: number; status: RiskStatus; }
export type RiskDraft = { risk: string; probability: number; impact: number };

export type IssueStatus = 'Open' | 'Resolved';
export interface Issue { id: string; projectId: string; title: string; priority: ProjectPriority; status: IssueStatus; }
export type IssueDraft = { title: string; priority: ProjectPriority };

export interface Stakeholder { id: string; projectId: string; name: string; role: string; }
export type StakeholderDraft = { name: string; role: string };

export interface Note { id: string; projectId: string; body: string; createdAt: string; }
export type NoteDraft = { body: string };
