import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/Button';
import { Chip } from '../../../components/Chip';
import { Input } from '../../../components/Input';
import { Screen } from '../../../components/Screen';
import { env } from '../../../config/env';
import { logout } from '../../auth/store/authSlice';
import { runSync, tasksCleared } from '../../tasks/store/tasksSlice';
import { getFcmToken } from '../../../services/notifications/messaging';
import { clearAllReminders } from '../../../services/notifications/reminders';
import {
  scheduleTestNotification,
  sendTestNotification,
} from '../../../services/notifications/testPush';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useTheme } from '../../../theme/ThemeProvider';
import { formatDateTime } from '../../../utils/date';
import { setTheme, type ThemeMode } from '../store/settingsSlice';

const modes: ThemeMode[] = ['system', 'light', 'dark'];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
        {title.toUpperCase()}
      </Text>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text style={{ color: theme.colors.textMuted }}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [testTitle, setTestTitle] = useState('TaskFlow');
  const [testBody, setTestBody] = useState('Your task is due soon.');
  const [testStatus, setTestStatus] = useState('');

  const user = useAppSelector(state => state.auth.user);
  const themeMode = useAppSelector(state => state.settings.themeMode);
  const { online, pending, syncing, lastSyncAt } = useAppSelector(
    state => state.tasks,
  );

  async function sendNow() {
    await sendTestNotification(testTitle, testBody);
    setTestStatus('Sent. It should be in the tray now.');
  }

  async function sendLater() {
    const scheduled = await scheduleTestNotification(testTitle, testBody, 10);
    setTestStatus(
      scheduled
        ? 'Arriving in 10 seconds. Background the app to see it land.'
        : 'Could not schedule. Check Alarms & reminders for this app.',
    );
  }

  async function signOutNow() {
    await clearAllReminders();
    dispatch(tasksCleared());
    dispatch(logout());
  }

  return (
    <Screen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Account">
          <Row label="Name" value={user?.name ?? '-'} />
          <Row label="Email" value={user?.email ?? '-'} />
        </Section>

        <Section title="Appearance">
          <View style={styles.chips}>
            {modes.map(mode => (
              <Chip
                key={mode}
                label={mode}
                active={themeMode === mode}
                onPress={() => dispatch(setTheme(mode))}
              />
            ))}
          </View>
        </Section>

        <Section title="Sync">
          <Row label="Network" value={online ? 'Online' : 'Offline'} />
          <Row label="Waiting to sync" value={String(pending)} />
          <Row
            label="Last sync"
            value={lastSyncAt ? formatDateTime(lastSyncAt) : 'Never'}
          />
          <Button
            label={syncing ? 'Syncing...' : 'Sync now'}
            variant="secondary"
            onPress={() => user && dispatch(runSync(user.uid))}
            disabled={syncing || !online}
            style={styles.button}
          />
        </Section>

        <Section title="Build">
          <Row label="Environment" value={env.name} />
          <Row label="Firebase project" value={env.firebaseProjectId} />
          <Row label="Push messages" value={env.enableFcm ? 'On' : 'Off'} />
        </Section>

        {env.enableDevMenu ? (
          <Section title="FIREBASE Notification test">
            <Input
              label="Title"
              value={testTitle}
              onChangeText={setTestTitle}
              placeholder="Notification title"
            />
            <Input
              label="Body"
              value={testBody}
              onChangeText={setTestBody}
              placeholder="Notification body"
              multiline
            />
            <Button
              label="Send test notification"
              variant="secondary"
              onPress={sendNow}
              disabled={!testTitle.trim()}
              style={styles.button}
            />
            {/* <Button
              label="Send one in 10 seconds"
              variant="secondary"
              onPress={sendLater}
              disabled={!testTitle.trim()}
              style={styles.button}
            /> */}
            {testStatus ? (
              <Text style={[styles.note, { color: theme.colors.textMuted }]}>
                {testStatus}
              </Text>
            ) : null}
            <Text style={[styles.note, { color: theme.colors.textMuted }]}>
              FCM token, long press to copy
            </Text>
            <Text
              selectable
              style={[styles.token, { color: theme.colors.text }]}
            >
              {getFcmToken() ?? 'Not registered on this device'}
            </Text>
          </Section>
        ) : null}

        <Button label="Log out" variant="danger" onPress={signOutNow} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  card: { borderWidth: 1, padding: 14 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowValue: { fontWeight: '500' },
  chips: { flexDirection: 'row' },
  button: { marginTop: 12 },
  note: { fontSize: 12, marginTop: 12 },
  token: { fontSize: 11, marginTop: 4 },
});
