import Config from 'react-native-config';

export type EnvName = 'development' | 'staging' | 'production';

function str(value: string | undefined, fallback: string) {
  return value && value.length > 0 ? value : fallback;
}

function num(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(value: string | undefined, fallback: boolean) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

export const env = {
  name: str(Config.ENV_NAME, 'development') as EnvName,
  appName: str(Config.APP_DISPLAY_NAME, 'TaskFlow Dev'),
  firebaseProjectId: str(Config.FIREBASE_PROJECT_ID, 'taskflow-dev'),
  syncBatchSize: num(Config.SYNC_BATCH_SIZE, 100),
  enableFcm: bool(Config.ENABLE_FCM, true),
  enableDevMenu: bool(Config.ENABLE_DEV_MENU, true),
  logLevel: str(Config.LOG_LEVEL, 'debug'),
};

export const isDev = env.name === 'development';
export const isProd = env.name === 'production';
