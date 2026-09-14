import { getDatabase } from '@/src/db/database';
import { id } from '@/src/lib/id';
import { isCriticalRisk } from '@/src/lib/project-health';
import type { Risk, RiskDraft, RiskStatus } from '@/src/types/project';

type Row = { id: string; project_id: string; risk: string; probability: number; impact: number; status: RiskStatus };
const mapRow = (row: Row): Risk => ({ id: row.id, projectId: row.project_id, risk: row.risk, probability: row.probability, impact: row.impact, status: row.status });

export const riskRepository = {
  async list(projectId: string): Promise<Risk[]> { const db = await getDatabase(); const rows = await db.getAllAsync<Row>('SELECT * FROM risks WHERE project_id = ? ORDER BY (probability * impact) DESC', [projectId]); return rows.map(mapRow); },

  async create(projectId: string, draft: RiskDraft): Promise<Risk> { const db = await getDatabase(); const risk: Risk = { id: id(), projectId, risk: draft.risk.trim(), probability: draft.probability, impact: draft.impact, status: 'Open' }; await db.runAsync('INSERT INTO risks (id, project_id, risk, probability, impact, status) VALUES (?,?,?,?,?,?)', [risk.id, risk.projectId, risk.risk, risk.probability, risk.impact, risk.status]); return risk; },

  async setStatus(riskId: string, status: RiskStatus): Promise<void> { const db = await getDatabase(); await db.runAsync('UPDATE risks SET status = ? WHERE id = ?', [status, riskId]); },

  async remove(riskId: string): Promise<void> { const db = await getDatabase(); await db.runAsync('DELETE FROM risks WHERE id = ?', [riskId]); },

  async countCritical(projectId: string): Promise<number> { const db = await getDatabase(); const rows = await db.getAllAsync<Row>('SELECT * FROM risks WHERE project_id = ? AND status = ?', [projectId, 'Open']); return rows.filter((row) => isCriticalRisk(row.probability, row.impact)).length; },
};
