import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from '@react-native-firebase/firestore';
import { TASKS_COLLECTION, USERS_COLLECTION } from '../../../config/constants';
import { firestore } from '../../../services/firebase';
import type { Task } from '../types';

function tasksRef(userId: string) {
  return collection(
    firestore(),
    `${USERS_COLLECTION}/${userId}/${TASKS_COLLECTION}`,
  );
}

function toRemote(task: Task) {
  return {
    id: task.id,
    title: task.title,
    notes: task.notes,
    completed: task.completed,
    priority: task.priority,
    dueAt: task.dueAt,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    deleted: task.deleted,
  };
}

function fromRemote(userId: string, data: Record<string, any>): Task {
  return {
    id: String(data.id),
    userId,
    title: String(data.title ?? ''),
    notes: String(data.notes ?? ''),
    completed: Boolean(data.completed),
    priority: (data.priority ?? 'medium') as Task['priority'],
    dueAt: data.dueAt ?? null,
    reminderId: null,
    createdAt: Number(data.createdAt ?? Date.now()),
    updatedAt: Number(data.updatedAt ?? Date.now()),
    deleted: Boolean(data.deleted),
    synced: true,
  };
}

export async function pushTasks(userId: string, tasks: Task[]) {
  if (!tasks.length) return;
  const batch = writeBatch(firestore());
  for (const task of tasks) {
    batch.set(doc(tasksRef(userId), task.id), toRemote(task));
  }
  await batch.commit();
}

export async function pullTasks(userId: string, since: number) {
  const snapshot = await getDocs(
    query(tasksRef(userId), where('updatedAt', '>', since)),
  );
  return snapshot.docs.map(item => fromRemote(userId, item.data()));
}
