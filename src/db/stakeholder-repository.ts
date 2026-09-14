import { getDatabase } from '@/src/db/database';
import { id } from '@/src/lib/id';
import type { Stakeholder, StakeholderDraft } from '@/src/types/project';

type Row = { id: string; project_id: string; name: string; role: string };
const mapRow = (row: Row): Stakeholder => ({ id: row.id, projectId: row.project_id, name: row.name, role: row.role });

export const stakeholderRepository = {
  async list(projectId: string): Promise<Stakeholder[]> { const db = await getDatabase(); const rows = await db.getAllAsync<Row>('SELECT * FROM stakeholders WHERE project_id = ? ORDER BY name ASC', [projectId]); return rows.map(mapRow); },

  async create(projectId: string, draft: StakeholderDraft): Promise<Stakeholder> { const db = await getDatabase(); const stakeholder: Stakeholder = { id: id(), projectId, name: draft.name.trim(), role: draft.role.trim() }; await db.runAsync('INSERT INTO stakeholders (id, project_id, name, role) VALUES (?,?,?,?)', [stakeholder.id, stakeholder.projectId, stakeholder.name, stakeholder.role]); return stakeholder; },

  async remove(stakeholderId: string): Promise<void> { const db = await getDatabase(); await db.runAsync('DELETE FROM stakeholders WHERE id = ?', [stakeholderId]); },
};
