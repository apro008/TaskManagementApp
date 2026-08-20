export const migrations = [
  `CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    completed INTEGER NOT NULL DEFAULT 0,
    priority TEXT NOT NULL DEFAULT 'medium',
    due_at INTEGER,
    reminder_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER NOT NULL DEFAULT 0,
    synced INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks (user_id, deleted, completed)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_synced ON tasks (user_id, synced)`,
  `CREATE TABLE IF NOT EXISTS sync_state (
    user_id TEXT PRIMARY KEY NOT NULL,
    last_pull_at INTEGER NOT NULL DEFAULT 0
  )`,
];
