import { getDatabase } from '@/src/db/database';
import { id } from '@/src/lib/id';
import type { Note, NoteDraft } from '@/src/types/project';

type Row = { id: string; project_id: string; body: string; created_at: string };
const mapRow = (row: Row): Note => ({ id: row.id, projectId: row.project_id, body: row.body, createdAt: row.created_at });

export const noteRepository = {
  async list(projectId: string): Promise<Note[]> { const db = await getDatabase(); const rows = await db.getAllAsync<Row>('SELECT * FROM notes WHERE project_id = ? ORDER BY created_at DESC', [projectId]); return rows.map(mapRow); },

  async create(projectId: string, draft: NoteDraft): Promise<Note> { const db = await getDatabase(); const note: Note = { id: id(), projectId, body: draft.body.trim(), createdAt: new Date().toISOString() }; await db.runAsync('INSERT INTO notes (id, project_id, body, created_at) VALUES (?,?,?,?)', [note.id, note.projectId, note.body, note.createdAt]); return note; },

  async remove(noteId: string): Promise<void> { const db = await getDatabase(); await db.runAsync('DELETE FROM notes WHERE id = ?', [noteId]); },
};
