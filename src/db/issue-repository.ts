import { getDatabase } from '@/src/db/database';
import { id } from '@/src/lib/id';
import type { Issue, IssueDraft, IssueStatus, ProjectPriority } from '@/src/types/project';

type Row = { id: string; project_id: string; title: string; priority: ProjectPriority; status: IssueStatus };
const mapRow = (row: Row): Issue => ({ id: row.id, projectId: row.project_id, title: row.title, priority: row.priority, status: row.status });

export const issueRepository = {
  async list(projectId: string): Promise<Issue[]> { const db = await getDatabase(); const rows = await db.getAllAsync<Row>('SELECT * FROM issues WHERE project_id = ? ORDER BY status ASC', [projectId]); return rows.map(mapRow); },

  async create(projectId: string, draft: IssueDraft): Promise<Issue> { const db = await getDatabase(); const issue: Issue = { id: id(), projectId, title: draft.title.trim(), priority: draft.priority, status: 'Open' }; await db.runAsync('INSERT INTO issues (id, project_id, title, priority, status) VALUES (?,?,?,?,?)', [issue.id, issue.projectId, issue.title, issue.priority, issue.status]); return issue; },

  async setStatus(issueId: string, status: IssueStatus): Promise<void> { const db = await getDatabase(); await db.runAsync('UPDATE issues SET status = ? WHERE id = ?', [status, issueId]); },

  async remove(issueId: string): Promise<void> { const db = await getDatabase(); await db.runAsync('DELETE FROM issues WHERE id = ?', [issueId]); },

  async countHighPriorityOpen(projectId: string): Promise<number> { const db = await getDatabase(); const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM issues WHERE project_id = ? AND status = ? AND priority IN (?, ?)', [projectId, 'Open', 'High', 'Critical']); return row?.n ?? 0; },
};
