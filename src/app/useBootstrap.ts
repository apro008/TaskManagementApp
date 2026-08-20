import { useEffect, useState } from 'react';
import { initDb } from '../db/database';
import { userChanged } from '../features/auth/store/authSlice';
import { watchAuth } from '../features/auth/services/authService';
import { loadTheme } from '../features/settings/store/settingsSlice';
import {
  setupMessaging,
  watchMessages,
} from '../services/notifications/messaging';
import { setupNotifications } from '../services/notifications/reminders';
import { useAppDispatch } from '../store/hooks';
import { log } from '../utils/logger';

export function useBootstrap() {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function start() {
      try {
        await initDb();
        await dispatch(loadTheme()).unwrap();
        await setupNotifications();
        await setupMessaging();
      } catch (error) {
        log.error('bootstrap failed', error);
      }
      if (active) setReady(true);
    }

    start();
    const stopMessages = watchMessages();
    const stopAuth = watchAuth(user => dispatch(userChanged(user)));

    return () => {
      active = false;
      stopMessages();
      stopAuth();
    };
  }, [dispatch]);

  return ready;
}
