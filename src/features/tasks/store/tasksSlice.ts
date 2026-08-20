import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import {
  cancelReminder,
  scheduleReminder,
} from '../../../services/notifications/reminders';
import {
  createTask,
  deleteTask,
  getTasks,
  saveTask,
  updateTask,
} from '../services/taskRepository';
import { countPending, syncTasks } from '../services/syncEngine';
import type { Task, TaskFilter, TaskInput } from '../types';

const adapter = createEntityAdapter<Task>({
  sortComparer: (a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.dueAt && b.dueAt) return a.dueAt - b.dueAt;
    if (a.dueAt) return -1;
    if (b.dueAt) return 1;
    return b.updatedAt - a.updatedAt;
  },
});

type TasksState = ReturnType<typeof adapter.getInitialState> & {
  loading: boolean;
  syncing: boolean;
  pending: number;
  online: boolean;
  filter: TaskFilter;
  search: string;
  lastSyncAt: number | null;
  error: string | null;
};

const initialState: TasksState = adapter.getInitialState({
  loading: false,
  syncing: false,
  pending: 0,
  online: true,
  filter: 'all' as TaskFilter,
  search: '',
  lastSyncAt: null,
  error: null,
});

export const loadTasks = createAsyncThunk(
  'tasks/load',
  async (userId: string) => {
    const tasks = await getTasks(userId);
    const pending = await countPending(userId);
    return { tasks, pending };
  },
);

export const addTask = createAsyncThunk(
  'tasks/add',
  async (args: { userId: string; input: TaskInput }, { dispatch }) => {
    const task = await createTask(args.userId, args.input);
    const reminderId = await scheduleReminder(task);
    const saved = reminderId ? await saveTask({ ...task, reminderId }) : task;
    dispatch(runSync(args.userId));
    return saved;
  },
);

export const editTask = createAsyncThunk(
  'tasks/edit',
  async (args: { id: string; changes: Partial<Task> }, { dispatch }) => {
    const updated = await updateTask(args.id, args.changes);
    if (!updated) throw new Error('Task not found');
    const reminderId = await scheduleReminder(updated);
    const saved = await saveTask({ ...updated, reminderId });
    dispatch(runSync(saved.userId));
    return saved;
  },
);

export const toggleTask = createAsyncThunk(
  'tasks/toggle',
  async (task: Task, { dispatch }) => {
    const updated = await updateTask(task.id, { completed: !task.completed });
    if (!updated) throw new Error('Task not found');
    const reminderId = updated.completed
      ? null
      : await scheduleReminder(updated);
    if (updated.completed) await cancelReminder(updated.reminderId);
    const saved = await saveTask({ ...updated, reminderId });
    dispatch(runSync(saved.userId));
    return saved;
  },
);

export const removeTask = createAsyncThunk(
  'tasks/remove',
  async (task: Task, { dispatch }) => {
    await cancelReminder(task.reminderId);
    await deleteTask(task.id);
    dispatch(runSync(task.userId));
    return task.id;
  },
);

export const runSync = createAsyncThunk(
  'tasks/sync',
  async (userId: string, { dispatch }) => {
    const result = await syncTasks(userId);
    if (!result.skipped && (result.pushed > 0 || result.pulled > 0)) {
      dispatch(loadTasks(userId));
    }
    return result;
  },
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    filterChanged(state, action: PayloadAction<TaskFilter>) {
      state.filter = action.payload;
    },
    searchChanged(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    onlineChanged(state, action: PayloadAction<boolean>) {
      state.online = action.payload;
    },
    tasksCleared(state) {
      adapter.removeAll(state);
      state.pending = 0;
      state.lastSyncAt = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadTasks.pending, state => {
        state.loading = true;
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.pending = action.payload.pending;
        adapter.setAll(state, action.payload.tasks);
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Could not load tasks';
      })
      .addCase(addTask.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload);
        state.pending += 1;
      })
      .addCase(editTask.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload);
      })
      .addCase(toggleTask.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload);
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        adapter.removeOne(state, action.payload);
      })
      .addCase(runSync.pending, state => {
        state.syncing = true;
      })
      .addCase(runSync.fulfilled, (state, action) => {
        state.syncing = false;
        if (!action.payload.skipped) {
          state.lastSyncAt = Date.now();
          state.pending = Math.max(0, state.pending - action.payload.pushed);
        }
      })
      .addCase(runSync.rejected, state => {
        state.syncing = false;
      });
  },
});

export const { filterChanged, searchChanged, onlineChanged, tasksCleared } =
  tasksSlice.actions;

export const tasksSelectors = adapter.getSelectors();

export default tasksSlice.reducer;
