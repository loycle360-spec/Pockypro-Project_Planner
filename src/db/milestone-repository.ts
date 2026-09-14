import { getDatabase } from '@/src/db/database';
import { id } from '@/src/lib/id';
import { todayKey } from '@/src/lib/dates';
import type { Milestone, MilestoneDraft, MilestoneStatus, MilestoneWithProject } from '@/src/types/project';

type Row = { id: string; project_id: string; name: string; target_date: string | null; status: MilestoneStatus };
const mapRow = (row: Row): Milestone => ({ id: row.id, projectId: row.project_id, name: row.name, targetDate: row.target_date, status: row.status });

export const milestoneRepository = {
  async list(projectId: string): Promise<Milestone[]> { const db = await getDatabase(); const rows = await db.getAllAsync<Row>('SELECT * FROM milestones WHERE project_id = ? ORDER BY (target_date IS NULL), target_date ASC', [projectId]); return rows.map(mapRow); },

  async listUpcomingWithProject(): Promise<MilestoneWithProject[]> { const db = await getDatabase(); const rows = await db.getAllAsync<Row & { project_name: string }>('SELECT milestones.*, projects.name AS project_name FROM milestones JOIN projects ON projects.id = milestones.project_id WHERE milestones.status = ? AND projects.archived = 0 ORDER BY (milestones.target_date IS NULL), milestones.target_date ASC', ['Planned']); return rows.map((row) => ({ ...mapRow(row), projectName: row.project_name })); },

  async create(projectId: string, draft: MilestoneDraft): Promise<Milestone> { const db = await getDatabase(); const milestone: Milestone = { id: id(), projectId, name: draft.name.trim(), targetDate: draft.targetDate, status: 'Planned' }; await db.runAsync('INSERT INTO milestones (id, project_id, name, target_date, status) VALUES (?,?,?,?,?)', [milestone.id, milestone.projectId, milestone.name, milestone.targetDate, milestone.status]); return milestone; },

  async setStatus(milestoneId: string, status: MilestoneStatus): Promise<void> { const db = await getDatabase(); await db.runAsync('UPDATE milestones SET status = ? WHERE id = ?', [status, milestoneId]); },

  async remove(milestoneId: string): Promise<void> { const db = await getDatabase(); await db.runAsync('DELETE FROM milestones WHERE id = ?', [milestoneId]); },

  async countDelayed(projectId: string): Promise<number> { const db = await getDatabase(); const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM milestones WHERE project_id = ? AND status = ? AND target_date IS NOT NULL AND target_date < ?', [projectId, 'Planned', todayKey()]); return row?.n ?? 0; },
};
