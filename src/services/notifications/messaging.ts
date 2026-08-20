import {
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { REMINDER_CHANNEL_ID } from '../../config/constants';
import { env } from '../../config/env';
import { log } from '../../utils/logger';

let fcmToken: string | null = null;

export function getFcmToken() {
  return fcmToken;
}

export async function showNotification(title: string, body: string) {
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: REMINDER_CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
    },
  });
}

export async function setupMessaging() {
  if (!env.enableFcm) return null;
  try {
    await requestPermission(getMessaging());
    const token = await getToken(getMessaging());
    fcmToken = token;
    log.info('fcm token', token);
    return token;
  } catch (error) {
    log.warn('messaging setup failed', error);
    return null;
  }
}

export function watchMessages() {
  if (!env.enableFcm) return () => {};
  const unsubMessage = onMessage(getMessaging(), async message => {
    const title = message.notification?.title ?? 'TaskFlow';
    const body = message.notification?.body ?? '';
    await showNotification(title, body);
  });
  const unsubToken = onTokenRefresh(getMessaging(), token => {
    fcmToken = token;
    log.info('fcm token refreshed', token);
  });
  return () => {
    unsubMessage();
    unsubToken();
  };
}

export function registerBackgroundHandler() {
  if (!env.enableFcm) return;
  setBackgroundMessageHandler(getMessaging(), async message => {
    log.info('background message', message.messageId);
  });
}
