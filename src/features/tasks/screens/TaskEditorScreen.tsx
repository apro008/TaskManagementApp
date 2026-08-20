import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../../components/Button';
import { Chip } from '../../../components/Chip';
import { Input } from '../../../components/Input';
import { Screen } from '../../../components/Screen';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useTheme } from '../../../theme/ThemeProvider';
import { formatDateTime } from '../../../utils/date';
import type { AppStackScreenProps } from '../../../navigation/types';
import { selectTaskById } from '../store/selectors';
import { addTask, editTask, removeTask } from '../store/tasksSlice';
import type { Priority } from '../types';

const priorities: Priority[] = ['low', 'medium', 'high'];

export default function TaskEditorScreen({
  navigation,
  route,
}: AppStackScreenProps<'TaskEditor'>) {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const taskId = route.params?.taskId;
  const user = useAppSelector(state => state.auth.user);
  const task = useAppSelector(state =>
    taskId ? selectTaskById(state, taskId) : undefined,
  );

  const [title, setTitle] = useState(task?.title ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [priority, setPriority] = useState<Priority>(
    task?.priority ?? 'medium',
  );
  const [dueAt, setDueAt] = useState<number | null>(task?.dueAt ?? null);
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);

  const valid = title.trim().length > 0;
  const heading = useMemo(() => (task ? 'Edit task' : 'New task'), [task]);

  function onPicked(value?: Date) {
    const mode = picker;
    setPicker(null);
    if (!value) return;
    if (mode === 'date') {
      const base = dueAt ? new Date(dueAt) : new Date();
      value.setHours(base.getHours(), base.getMinutes(), 0, 0);
      setDueAt(value.getTime());
      setTimeout(() => setPicker('time'), 150);
    } else {
      setDueAt(value.getTime());
    }
  }

  function save() {
    if (!valid || !user) return;
    const input = {
      title: title.trim(),
      notes: notes.trim(),
      priority,
      dueAt,
    };
    if (task) {
      dispatch(editTask({ id: task.id, changes: input }));
    } else {
      dispatch(addTask({ userId: user.uid, input }));
    }
    navigation.goBack();
  }

  function confirmDelete() {
    if (!task) return;
    Alert.alert('Delete task', 'This task will be removed from all devices.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          dispatch(removeTask(task));
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <Screen edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={[
              styles.heading,
              { color: theme.colors.text, fontSize: theme.fontSize.lg },
            ]}
          >
            {heading}
          </Text>

          <Input
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="What needs doing?"
          />
          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional details"
            multiline
            style={styles.notes}
          />

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            Priority
          </Text>
          <View style={styles.chips}>
            {priorities.map(item => (
              <Chip
                key={item}
                label={item}
                active={priority === item}
                onPress={() => setPriority(item)}
              />
            ))}
          </View>

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            Reminder
          </Text>
          <Pressable
            onPress={() => setPicker('date')}
            style={[
              styles.dueBox,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <Text
              style={{
                color: dueAt ? theme.colors.text : theme.colors.textMuted,
              }}
            >
              {dueAt ? formatDateTime(dueAt) : 'Set a due date and time'}
            </Text>
          </Pressable>

          {dueAt ? (
            <Pressable onPress={() => setDueAt(null)} style={styles.clear}>
              <Text style={{ color: theme.colors.primary }}>
                Clear reminder
              </Text>
            </Pressable>
          ) : null}

          {picker ? (
            <DateTimePicker
              value={dueAt ? new Date(dueAt) : new Date()}
              mode={picker}
              minimumDate={picker === 'date' ? new Date() : undefined}
              onChange={(_event, value) => onPicked(value)}
            />
          ) : null}

          <Button
            label={task ? 'Save changes' : 'Add task'}
            onPress={save}
            disabled={!valid}
            style={styles.save}
          />

          {task ? (
            <Button
              label="Delete task"
              variant="danger"
              onPress={confirmDelete}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  heading: { fontWeight: '700', marginBottom: 20 },
  notes: { minHeight: 90, textAlignVertical: 'top' },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  chips: { flexDirection: 'row', marginBottom: 20 },
  dueBox: { borderWidth: 1, padding: 14, marginBottom: 8 },
  clear: { paddingVertical: 8, marginBottom: 8 },
  save: { marginTop: 16, marginBottom: 12 },
});
