import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';
import { Platform } from 'react-native';
import { REMINDER_CHANNEL_ID } from '../../config/constants';
import { log } from '../../utils/logger';
import type { Task } from '../../features/tasks/types';

let ready = false;

export async function setupNotifications() {
  if (ready) return;
  const settings = await notifee.requestPermission();
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: 'Task reminders',
      importance: AndroidImportance.HIGH,
    });
  }
  ready = true;
  log.info('notifications ready', settings.authorizationStatus);
}

export async function scheduleReminder(task: Task) {
  await cancelReminder(task.reminderId);
  if (!task.dueAt || task.completed || task.deleted) return null;
  if (task.dueAt <= Date.now()) return null;

  try {
    const id = await notifee.createTriggerNotification(
      {
        title: 'Task due',
        body: task.title,
        data: { taskId: task.id },
        android: {
          channelId: REMINDER_CHANNEL_ID,
          pressAction: { id: 'default' },
        },
        ios: { sound: 'default' },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: task.dueAt,
        alarmManager: { allowWhileIdle: true },
      },
    );
    return id;
  } catch (error) {
    log.warn('could not schedule reminder', error);
    return null;
  }
}

export async function cancelReminder(reminderId: string | null) {
  if (!reminderId) return;
  try {
    await notifee.cancelTriggerNotification(reminderId);
  } catch (error) {
    log.warn('could not cancel reminder', error);
  }
}

export async function clearAllReminders() {
  await notifee.cancelAllNotifications();
}
