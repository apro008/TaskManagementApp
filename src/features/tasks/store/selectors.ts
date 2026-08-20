import countBy from 'lodash/countBy';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';
import { tasksSelectors } from './tasksSlice';

const selectAll = (state: RootState) => tasksSelectors.selectAll(state.tasks);
const selectFilter = (state: RootState) => state.tasks.filter;
const selectSearch = (state: RootState) => state.tasks.search;

export const selectVisibleTasks = createSelector(
  [selectAll, selectFilter, selectSearch],
  (tasks, filter, search) => {
    const text = search.trim().toLowerCase();
    return tasks.filter(task => {
      if (filter === 'active' && task.completed) return false;
      if (filter === 'done' && !task.completed) return false;
      if (!text) return true;
      return (
        task.title.toLowerCase().includes(text) ||
        task.notes.toLowerCase().includes(text)
      );
    });
  },
);

export const selectTaskById = (state: RootState, id: string) =>
  tasksSelectors.selectById(state.tasks, id);

export const selectCounts = createSelector([selectAll], tasks => {
  const counts = countBy(tasks, task => (task.completed ? 'done' : 'active'));
  return {
    all: tasks.length,
    active: counts.active ?? 0,
    done: counts.done ?? 0,
  };
});
