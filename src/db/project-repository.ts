import { getDatabase } from '@/src/db/database';
import { id } from '@/src/lib/id';
import { calculateProjectHealth } from '@/src/lib/project-health';
import { taskRepository } from '@/src/db/task-repository';
import { milestoneRepository } from '@/src/db/milestone-repository';
import { riskRepository } from '@/src/db/risk-repository';
import { issueRepository } from '@/src/db/issue-repository';
import type { Project, ProjectDraft } from '@/src/types/project';

type Row = Omit<Project, 'successCriteria' | 'projectManager' | 'startDate' | 'targetDate' | 'createdAt' | 'updatedAt' | 'archived'> & { success_criteria: string; project_manager: string; start_date: string | null; target_date: string | null; created_at: string; updated_at: string; archived: number };
const mapRow = (row: Row): Project => ({ id: row.id, name: row.name, description: row.description, purpose: row.purpose, problem: row.problem, objectives: row.objectives, successCriteria: row.success_criteria, sponsor: row.sponsor, projectManager: row.project_manager, startDate: row.start_date, targetDate: row.target_date, methodology: row.methodology, status: row.status, priority: row.priority, health: row.health, createdAt: row.created_at, updatedAt: row.updated_at, archived: Boolean(row.archived) });

export const projectRepository = {
  async list(search = ''): Promise<Project[]> { const db = await getDatabase(); const term = `%${search.trim()}%`; const rows = await db.getAllAsync<Row>('SELECT * FROM projects WHERE archived = 0 AND (name LIKE ? OR description LIKE ?) ORDER BY updated_at DESC', [term, term]); return rows.map(mapRow); },
  async get(projectId: string): Promise<Project | null> { const db = await getDatabase(); const row = await db.getFirstAsync<Row>('SELECT * FROM projects WHERE id = ?', [projectId]); return row ? mapRow(row) : null; },
  async create(draft: ProjectDraft): Promise<Project> { const db = await getDatabase(); const now = new Date().toISOString(); const project: Project = { ...draft, id: id(), health: 'Healthy', archived: false, createdAt: now, updatedAt: now }; await db.runAsync('INSERT INTO projects (id,name,description,purpose,problem,objectives,success_criteria,sponsor,project_manager,start_date,target_date,methodology,status,priority,health,archived,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [project.id, project.name.trim(), project.description.trim(), project.purpose.trim(), project.problem.trim(), project.objectives.trim(), project.successCriteria.trim(), project.sponsor.trim(), project.projectManager.trim(), project.startDate, project.targetDate, project.methodology, project.status, project.priority, project.health, 0, now, now]); return project; },

  async update(projectId: string, draft: ProjectDraft): Promise<void> { const db = await getDatabase(); const now = new Date().toISOString(); await db.runAsync('UPDATE projects SET name=?, description=?, purpose=?, problem=?, objectives=?, success_criteria=?, sponsor=?, project_manager=?, start_date=?, target_date=?, methodology=?, status=?, priority=?, updated_at=? WHERE id=?', [draft.name.trim(), draft.description.trim(), draft.purpose.trim(), draft.problem.trim(), draft.objectives.trim(), draft.successCriteria.trim(), draft.sponsor.trim(), draft.projectManager.trim(), draft.startDate, draft.targetDate, draft.methodology, draft.status, draft.priority, now, projectId]); },

  async archive(projectId: string): Promise<void> { const db = await getDatabase(); await db.runAsync('UPDATE projects SET archived = 1, updated_at = ? WHERE id = ?', [new Date().toISOString(), projectId]); },

  async setOnboarded(): Promise<void> { const db = await getDatabase(); await db.runAsync('INSERT OR REPLACE INTO app_settings(key,value) VALUES (?,?)', ['onboardingComplete', 'true']); },
  async isOnboarded(): Promise<boolean> { const db = await getDatabase(); const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_settings WHERE key = ?', ['onboardingComplete']); return row?.value === 'true'; },

  async recalculateHealth(projectId: string): Promise<Project['health']> {
    const [overdueTasks, delayedMilestones, criticalRisks, highPriorityIssues] = await Promise.all([
      taskRepository.countOverdue(projectId),
      milestoneRepository.countDelayed(projectId),
      riskRepository.countCritical(projectId),
      issueRepository.countHighPriorityOpen(projectId),
    ]);
    const { health } = calculateProjectHealth({ overdueTasks, delayedMilestones, criticalRisks, highPriorityIssues });
    const db = await getDatabase();
    await db.runAsync('UPDATE projects SET health = ? WHERE id = ?', [health, projectId]);
    return health;
  },
};
