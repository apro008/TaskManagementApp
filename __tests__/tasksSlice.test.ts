import reducer, {
  filterChanged,
  onlineChanged,
  searchChanged,
  tasksCleared,
} from '../src/features/tasks/store/tasksSlice';

describe('tasks reducer', () => {
  const initial = reducer(undefined, { type: 'init' });

  it('starts empty and unfiltered', () => {
    expect(initial.ids).toHaveLength(0);
    expect(initial.filter).toBe('all');
    expect(initial.pending).toBe(0);
  });

  it('changes the filter', () => {
    const next = reducer(initial, filterChanged('done'));
    expect(next.filter).toBe('done');
  });

  it('stores the search text', () => {
    const next = reducer(initial, searchChanged('report'));
    expect(next.search).toBe('report');
  });

  it('tracks connectivity', () => {
    const next = reducer(initial, onlineChanged(false));
    expect(next.online).toBe(false);
  });

  it('clears tasks on logout', () => {
    const next = reducer({ ...initial, pending: 3 }, tasksCleared());
    expect(next.pending).toBe(0);
    expect(next.ids).toHaveLength(0);
  });
});
