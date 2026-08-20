jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    ENV_NAME: 'development',
    APP_DISPLAY_NAME: 'TaskFlow Dev',
    FIREBASE_PROJECT_ID: 'taskflow-dev',
    SYNC_BATCH_SIZE: '100',
    ENABLE_FCM: 'false',
    ENABLE_DEV_MENU: 'true',
    LOG_LEVEL: 'error',
  },
}));

jest.mock('@op-engineering/op-sqlite', () => ({
  open: () => ({
    execute: jest.fn(async () => ({ rows: [], rowsAffected: 0 })),
    executeSync: jest.fn(() => ({ rows: [], rowsAffected: 0 })),
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(async () => ({
    isConnected: true,
    isInternetReachable: true,
  })),
  addEventListener: jest.fn(() => () => {}),
}));

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn(async () => ({ authorizationStatus: 1 })),
    createChannel: jest.fn(async () => 'channel'),
    createTriggerNotification: jest.fn(async () => 'notification-id'),
    cancelTriggerNotification: jest.fn(async () => undefined),
    cancelAllNotifications: jest.fn(async () => undefined),
    displayNotification: jest.fn(async () => undefined),
    getNotificationSettings: jest.fn(async () => ({ authorizationStatus: 1 })),
  },
  AndroidImportance: { HIGH: 4 },
  AuthorizationStatus: { AUTHORIZED: 1 },
  TriggerType: { TIMESTAMP: 0 },
}));

jest.mock('@react-native-firebase/app', () => ({ getApp: jest.fn() }));

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(() => () => {}),
  updateProfile: jest.fn(),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(async () => ({ docs: [] })),
  query: jest.fn(),
  where: jest.fn(),
  writeBatch: jest.fn(() => ({
    set: jest.fn(),
    commit: jest.fn(async () => undefined),
  })),
}));

jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(),
  getToken: jest.fn(async () => 'token'),
  onMessage: jest.fn(() => () => {}),
  onTokenRefresh: jest.fn(() => () => {}),
  requestPermission: jest.fn(async () => 1),
  setBackgroundMessageHandler: jest.fn(),
}));
