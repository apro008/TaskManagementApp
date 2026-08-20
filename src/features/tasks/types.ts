export type Priority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  userId: string;
  title: string;
  notes: string;
  completed: boolean;
  priority: Priority;
  dueAt: number | null;
  reminderId: string | null;
  createdAt: number;
  updatedAt: number;
  deleted: boolean;
  synced: boolean;
};

export type TaskInput = {
  title: string;
  notes: string;
  priority: Priority;
  dueAt: number | null;
};

export type TaskFilter = 'all' | 'active' | 'done';
