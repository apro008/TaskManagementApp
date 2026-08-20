import {
  selectCounts,
  selectVisibleTasks,
} from '../src/features/tasks/store/selectors';
import type { RootState } from '../src/store';
import type { Task } from '../src/features/tasks/types';

function task(id: string, title: string, completed: boolean): Task {
  return {
    id,
    userId: 'user-1',
    title,
    notes: '',
    completed,
    priority: 'medium',
    dueAt: null,
    reminderId: null,
    createdAt: 1,
    updatedAt: 1,
    deleted: false,
    synced: true,
  };
}

function makeState(filter: string, search: string): RootState {
  const items = [
    task('1', 'Buy milk', false),
    task('2', 'Send report', true),
    task('3', 'Call plumber', false),
  ];
  return {
    tasks: {
      ids: items.map(item => item.id),
      entities: Object.fromEntries(items.map(item => [item.id, item])),
      filter,
      search,
    },
  } as unknown as RootState;
}

describe('task selectors', () => {
  it('returns everything by default', () => {
    expect(selectVisibleTasks(makeState('all', ''))).toHaveLength(3);
  });

  it('filters active tasks', () => {
    const result = selectVisibleTasks(makeState('active', ''));
    expect(result.map(item => item.id)).toEqual(['1', '3']);
  });

  it('filters done tasks', () => {
    const result = selectVisibleTasks(makeState('done', ''));
    expect(result.map(item => item.id)).toEqual(['2']);
  });

  it('matches the search text', () => {
    const result = selectVisibleTasks(makeState('all', 'plumb'));
    expect(result.map(item => item.id)).toEqual(['3']);
  });

  it('counts tasks by state', () => {
    expect(selectCounts(makeState('all', ''))).toEqual({
      all: 3,
      active: 2,
      done: 1,
    });
  });
});
