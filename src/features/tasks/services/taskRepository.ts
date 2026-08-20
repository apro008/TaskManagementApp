import type { Scalar } from '@op-engineering/op-sqlite';
import { getDb } from '../../../db/database';
import { makeId } from '../../../utils/id';
import type { Task, TaskInput } from '../types';

function toTask(row: Record<string, Scalar>): Task {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title),
    notes: String(row.notes ?? ''),
    completed: Number(row.completed) === 1,
    priority: String(row.priority) as Task['priority'],
    dueAt: row.due_at === null ? null : Number(row.due_at),
    reminderId: row.reminder_id === null ? null : String(row.reminder_id),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    deleted: Number(row.deleted) === 1,
    synced: Number(row.synced) === 1,
  };
}

export async function getTasks(userId: string) {
  const db = getDb();
  const result = await db.execute(
    'SELECT * FROM tasks WHERE user_id = ? AND deleted = 0 ORDER BY completed ASC, updated_at DESC',
    [userId],
  );
  return result.rows.map(toTask);
}

export async function getTask(id: string) {
  const db = getDb();
  const result = await db.execute('SELECT * FROM tasks WHERE id = ?', [id]);
  return result.rows.length ? toTask(result.rows[0]) : null;
}

export async function createTask(userId: string, input: TaskInput) {
  const now = Date.now();
  const task: Task = {
    id: makeId(),
    userId,
    title: input.title,
    notes: input.notes,
    completed: false,
    priority: input.priority,
    dueAt: input.dueAt,
    reminderId: null,
    createdAt: now,
    updatedAt: now,
    deleted: false,
    synced: false,
  };
  await saveTask(task);
  return task;
}

export async function saveTask(task: Task) {
  const db = getDb();
  await db.execute(
    `INSERT OR REPLACE INTO tasks
      (id, user_id, title, notes, completed, priority, due_at, reminder_id, created_at, updated_at, deleted, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.id,
      task.userId,
      task.title,
      task.notes,
      task.completed ? 1 : 0,
      task.priority,
      task.dueAt,
      task.reminderId,
      task.createdAt,
      task.updatedAt,
      task.deleted ? 1 : 0,
      task.synced ? 1 : 0,
    ],
  );
  return task;
}

export async function updateTask(id: string, changes: Partial<Task>) {
  const current = await getTask(id);
  if (!current) return null;
  const next: Task = {
    ...current,
    ...changes,
    updatedAt: Date.now(),
    synced: false,
  };
  await saveTask(next);
  return next;
}

export async function deleteTask(id: string) {
  return updateTask(id, { deleted: true });
}

export async function getUnsyncedTasks(userId: string, limit: number) {
  const db = getDb();
  const result = await db.execute(
    'SELECT * FROM tasks WHERE user_id = ? AND synced = 0 LIMIT ?',
    [userId, limit],
  );
  return result.rows.map(toTask);
}

export async function markSynced(ids: string[]) {
  if (!ids.length) return;
  const db = getDb();
  const holes = ids.map(() => '?').join(',');
  await db.execute(`UPDATE tasks SET synced = 1 WHERE id IN (${holes})`, ids);
}

export async function purgeSyncedDeletes(userId: string) {
  const db = getDb();
  await db.execute(
    'DELETE FROM tasks WHERE user_id = ? AND deleted = 1 AND synced = 1',
    [userId],
  );
}

export async function getLastPullAt(userId: string) {
  const db = getDb();
  const result = await db.execute(
    'SELECT last_pull_at FROM sync_state WHERE user_id = ?',
    [userId],
  );
  return result.rows.length ? Number(result.rows[0].last_pull_at) : 0;
}

export async function setLastPullAt(userId: string, value: number) {
  const db = getDb();
  await db.execute(
    'INSERT OR REPLACE INTO sync_state (user_id, last_pull_at) VALUES (?, ?)',
    [userId, value],
  );
}
