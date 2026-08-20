import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice';
import settingsReducer from '../features/settings/store/settingsSlice';
import tasksReducer from '../features/tasks/store/tasksSlice';
import { isDev } from '../config/env';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    settings: settingsReducer,
  },
  devTools: isDev,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
