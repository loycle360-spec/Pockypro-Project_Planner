import * as SQLite from 'expo-sqlite';

let database: SQLite.SQLiteDatabase | null = null;
export async function getDatabase() {
  if (database) return database;
  database = await SQLite.openDatabaseAsync('pocket-project.db');
  await database.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await database.execAsync(`CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY);`);
  const migration = await database.getFirstAsync<{ version: number }>('SELECT MAX(version) AS version FROM schema_migrations');
  if (!migration?.version) {
    await database.execAsync(`CREATE TABLE projects (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', purpose TEXT NOT NULL DEFAULT '', problem TEXT NOT NULL DEFAULT '', objectives TEXT NOT NULL DEFAULT '', success_criteria TEXT NOT NULL DEFAULT '', sponsor TEXT NOT NULL DEFAULT '', project_manager TEXT NOT NULL DEFAULT '', start_date TEXT, target_date TEXT, methodology TEXT NOT NULL, status TEXT NOT NULL, priority TEXT NOT NULL, health TEXT NOT NULL, archived INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE TABLE app_settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
      CREATE TABLE tasks (id TEXT PRIMARY KEY NOT NULL, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE, title TEXT NOT NULL, status TEXT NOT NULL, due_date TEXT, completed_at TEXT);
      CREATE TABLE milestones (id TEXT PRIMARY KEY NOT NULL, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE, name TEXT NOT NULL, target_date TEXT, status TEXT NOT NULL);
      CREATE TABLE risks (id TEXT PRIMARY KEY NOT NULL, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE, risk TEXT NOT NULL, probability INTEGER NOT NULL, impact INTEGER NOT NULL, status TEXT NOT NULL);
      CREATE TABLE issues (id TEXT PRIMARY KEY NOT NULL, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE, title TEXT NOT NULL, priority TEXT NOT NULL, status TEXT NOT NULL);
      CREATE TABLE stakeholders (id TEXT PRIMARY KEY NOT NULL, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT '');
      CREATE TABLE notes (id TEXT PRIMARY KEY NOT NULL, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE, body TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE task_dependencies (task_id TEXT NOT NULL, depends_on_task_id TEXT NOT NULL, PRIMARY KEY(task_id, depends_on_task_id));
      CREATE TABLE project_settings (project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE, key TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY(project_id, key));
      INSERT INTO schema_migrations(version) VALUES (1);`);
  }
  return database;
}
