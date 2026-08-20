import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { Chip } from '../../../components/Chip';
import { EmptyState } from '../../../components/EmptyState';
import { Input } from '../../../components/Input';
import { Screen } from '../../../components/Screen';
import { StatusBanner } from '../../../components/StatusBanner';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useTheme } from '../../../theme/ThemeProvider';
import type { AppStackScreenProps } from '../../../navigation/types';
import { ROW_HEIGHT, TaskRow } from '../components/TaskRow';
import { selectCounts, selectVisibleTasks } from '../store/selectors';
import {
  filterChanged,
  loadTasks,
  runSync,
  searchChanged,
  toggleTask,
} from '../store/tasksSlice';
import type { Task, TaskFilter } from '../types';

const filters: TaskFilter[] = ['all', 'active', 'done'];

export default function TaskListScreen({
  navigation,
}: AppStackScreenProps<'TaskList'>) {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const user = useAppSelector(state => state.auth.user);
  const tasks = useAppSelector(selectVisibleTasks);
  const counts = useAppSelector(selectCounts);
  const { loading, syncing, pending, online, filter, search } = useAppSelector(
    state => state.tasks,
  );

  const [searchText, setSearchText] = useState(search);

  useEffect(() => {
    if (user) dispatch(loadTasks(user.uid));
  }, [dispatch, user]);

  const applySearch = useMemo(
    () => debounce((value: string) => dispatch(searchChanged(value)), 250),
    [dispatch],
  );

  useEffect(() => () => applySearch.cancel(), [applySearch]);

  const onSearch = useCallback(
    (value: string) => {
      setSearchText(value);
      applySearch(value);
    },
    [applySearch],
  );

  const onToggle = useCallback(
    (task: Task) => {
      dispatch(toggleTask(task));
    },
    [dispatch],
  );

  const onOpen = useCallback(
    (task: Task) => {
      navigation.navigate('TaskEditor', { taskId: task.id });
    },
    [navigation],
  );

  const onRefresh = useCallback(() => {
    if (user) dispatch(runSync(user.uid));
  }, [dispatch, user]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Task>) => (
      <TaskRow task={item} onToggle={onToggle} onPress={onOpen} />
    ),
    [onToggle, onOpen],
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

  const getItemLayout = useCallback(
    (_data: ArrayLike<Task> | null | undefined, index: number) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <Screen>
      <StatusBanner online={online} syncing={syncing} pending={pending} />

      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textMuted }]}>
            Hello{user?.name ? `, ${user.name}` : ''}
          </Text>
          <Text
            style={[
              styles.heading,
              { color: theme.colors.text, fontSize: theme.fontSize.xl },
            ]}
          >
            My tasks
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          hitSlop={10}
          style={[
            styles.settings,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.gear, { color: theme.colors.text }]}>⚙</Text>
        </Pressable>
      </View>

      <View style={styles.search}>
        <Input
          value={searchText}
          onChangeText={onSearch}
          placeholder="Search tasks"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.filters}>
        {filters.map(item => (
          <Chip
            key={item}
            label={`${(item.toString().toUpperCase())} (${counts[item]})`}
            active={filter === item}
            onPress={() => dispatch(filterChanged(item))}
          />
        ))}
      </View>

      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.list}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={loading || syncing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="Nothing here yet"
            message="Add your first task with the button below. Everything is saved on device and syncs when you are online."
          />
        }
      />

      <Pressable
        onPress={() => navigation.navigate('TaskEditor', {})}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={[styles.fabText, { color: theme.colors.primaryText }]}>
          +
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  greeting: { fontSize: 14 },
  heading: { fontWeight: '700', marginTop: 2 },
  settings: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gear: { fontSize: 18 },
  search: { paddingHorizontal: 20, paddingTop: 14 },
  filters: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { fontSize: 30, fontWeight: '600', marginTop: -3 },
});
