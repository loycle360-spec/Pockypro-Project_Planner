import { getDatabase } from '@/src/db/database';
import { id } from '@/src/lib/id';
import { todayKey } from '@/src/lib/dates';
import type { Task, TaskDraft, TaskStatus, TaskWithProject } from '@/src/types/project';

type Row = { id: string; project_id: string; title: string; status: TaskStatus; due_date: string | null; completed_at: string | null };
const mapRow = (row: Row): Task => ({ id: row.id, projectId: row.project_id, title: row.title, status: row.status, dueDate: row.due_date, completedAt: row.completed_at });

export const taskRepository = {
  async list(projectId: string): Promise<Task[]> { const db = await getDatabase(); const rows = await db.getAllAsync<Row>('SELECT * FROM tasks WHERE project_id = ? ORDER BY (due_date IS NULL), due_date ASC', [projectId]); return rows.map(mapRow); },

  async listOpenWithProject(): Promise<TaskWithProject[]> { const db = await getDatabase(); const rows = await db.getAllAsync<Row & { project_name: string }>('SELECT tasks.*, projects.name AS project_name FROM tasks JOIN projects ON projects.id = tasks.project_id WHERE tasks.status != ? AND projects.archived = 0 ORDER BY (tasks.due_date IS NULL), tasks.due_date ASC', ['Done']); return rows.map((row) => ({ ...mapRow(row), projectName: row.project_name })); },

  async create(projectId: string, draft: TaskDraft): Promise<Task> { const db = await getDatabase(); const task: Task = { id: id(), projectId, title: draft.title.trim(), status: 'To Do', dueDate: draft.dueDate, completedAt: null }; await db.runAsync('INSERT INTO tasks (id, project_id, title, status, due_date, completed_at) VALUES (?,?,?,?,?,?)', [task.id, task.projectId, task.title, task.status, task.dueDate, task.completedAt]); return task; },

  async setStatus(taskId: string, status: TaskStatus): Promise<void> { const db = await getDatabase(); const completedAt = status === 'Done' ? new Date().toISOString() : null; await db.runAsync('UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?', [status, completedAt, taskId]); },

  async remove(taskId: string): Promise<void> { const db = await getDatabase(); await db.runAsync('DELETE FROM tasks WHERE id = ?', [taskId]); },

  async countOverdue(projectId: string): Promise<number> { const db = await getDatabase(); const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM tasks WHERE project_id = ? AND status != ? AND due_date IS NOT NULL AND due_date < ?', [projectId, 'Done', todayKey()]); return row?.n ?? 0; },
};
