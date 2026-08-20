import { env } from '../../../config/env';
import { isOnline } from '../../../services/connectivity/network';
import { log } from '../../../utils/logger';
import {
  getLastPullAt,
  getTask,
  getUnsyncedTasks,
  markSynced,
  purgeSyncedDeletes,
  saveTask,
  setLastPullAt,
} from './taskRepository';
import { pullTasks, pushTasks } from './taskRemote';

export type SyncResult = {
  pushed: number;
  pulled: number;
  skipped: boolean;
};

let running = false;

export async function syncTasks(userId: string): Promise<SyncResult> {
  if (running) return { pushed: 0, pulled: 0, skipped: true };
  if (!(await isOnline())) return { pushed: 0, pulled: 0, skipped: true };

  running = true;
  try {
    const pending = await getUnsyncedTasks(userId, env.syncBatchSize);
    if (pending.length) {
      await pushTasks(userId, pending);
      await markSynced(pending.map(task => task.id));
    }

    const since = await getLastPullAt(userId);
    const remote = await pullTasks(userId, since);
    let latest = since;
    let applied = 0;

    for (const task of remote) {
      if (task.updatedAt > latest) latest = task.updatedAt;
      const local = await getTask(task.id);
      if (local && (!local.synced || local.updatedAt >= task.updatedAt))
        continue;
      await saveTask({ ...task, reminderId: local?.reminderId ?? null });
      applied += 1;
    }

    if (latest > since) await setLastPullAt(userId, latest);
    await purgeSyncedDeletes(userId);

    log.info('sync done', { pushed: pending.length, pulled: applied });
    return { pushed: pending.length, pulled: applied, skipped: false };
  } catch (error) {
    log.warn('sync failed', error);
    return { pushed: 0, pulled: 0, skipped: true };
  } finally {
    running = false;
  }
}

export async function countPending(userId: string) {
  const pending = await getUnsyncedTasks(userId, env.syncBatchSize);
  return pending.length;
}
