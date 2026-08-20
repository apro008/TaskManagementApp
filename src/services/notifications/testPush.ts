import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';
import { REMINDER_CHANNEL_ID } from '../../config/constants';
import { log } from '../../utils/logger';
import { showNotification } from './messaging';

export async function sendTestNotification(title: string, body: string) {
  await showNotification(title, body);
}

export async function scheduleTestNotification(
  title: string,
  body: string,
  seconds: number,
) {
  try {
    await notifee.createTriggerNotification(
      {
        title,
        body,
        android: {
          channelId: REMINDER_CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          pressAction: { id: 'default' },
        },
        ios: { sound: 'default' },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + seconds * 1000,
        alarmManager: { allowWhileIdle: true },
      },
    );
    return true;
  } catch (error) {
    log.warn('could not schedule test notification', error);
    return false;
  }
}
