import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { onlineChanged, runSync } from '../features/tasks/store/tasksSlice';
import { watchNetwork } from '../services/connectivity/network';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export function useSync() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state => state.auth.user?.uid);
  const online = useAppSelector(state => state.tasks.online);
  const wasOnline = useRef(online);

  useEffect(() => {
    return watchNetwork(next => dispatch(onlineChanged(next)));
  }, [dispatch]);

  useEffect(() => {
    if (!userId) return;
    if (online && !wasOnline.current) dispatch(runSync(userId));
    wasOnline.current = online;
  }, [dispatch, online, userId]);

  useEffect(() => {
    if (!userId) return;
    dispatch(runSync(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    if (!userId) return;
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') dispatch(runSync(userId));
    });
    return () => sub.remove();
  }, [dispatch, userId]);
}
