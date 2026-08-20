import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import { formatDateTime, isOverdue } from '../../../utils/date';
import type { Task } from '../types';

export const ROW_HEIGHT = 88;

type Props = {
  task: Task;
  onToggle: (task: Task) => void;
  onPress: (task: Task) => void;
};

function Row({ task, onToggle, onPress }: Props) {
  const { variants } = useTheme();
  const row = variants.taskRow;

  const late = isOverdue(task.dueAt, task.completed);
  const state = task.completed ? 'done' : 'open';

  return (
    <Pressable
      onPress={() => onPress(task)}
      style={({ pressed }) => [styles.row, row.card, pressed && styles.pressed]}
    >
      <Pressable
        onPress={() => onToggle(task)}
        hitSlop={10}
        style={[styles.check, row.check[state]]}
      >
        {task.completed ? <Text style={[styles.tick, row.tick]}>✓</Text> : null}
      </Pressable>

      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.title, row.title[state]]}>
          {task.title}
        </Text>

        {task.notes ? (
          <Text numberOfLines={1} style={[styles.notes, row.notes]}>
            {task.notes}
          </Text>
        ) : null}

        <View style={styles.meta}>
          <View style={[styles.dot, row.priority[task.priority]]} />
          <Text style={[styles.metaText, row.due[late ? 'late' : 'onTime']]}>
            {task.dueAt ? formatDateTime(task.dueAt) : 'No due date'}
          </Text>
          {!task.synced ? (
            <Text style={[styles.metaText, row.unsynced]}>
              {'  •  not synced'}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export const TaskRow = memo(Row);

const styles = StyleSheet.create({
  row: {
    height: ROW_HEIGHT - 10,
    marginBottom: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  pressed: { opacity: 0.9 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  tick: { fontSize: 14, fontWeight: '700' },
  body: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  notes: { fontSize: 13, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  metaText: { fontSize: 12 },
});
