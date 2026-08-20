declare module 'react-native-config' {
  export interface NativeConfig {
    ENV_NAME?: string;
    APP_DISPLAY_NAME?: string;
    FIREBASE_PROJECT_ID?: string;
    SYNC_BATCH_SIZE?: string;
    ENABLE_FCM?: string;
    ENABLE_DEV_MENU?: string;
    LOG_LEVEL?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
