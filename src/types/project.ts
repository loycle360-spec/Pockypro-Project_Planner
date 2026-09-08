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
