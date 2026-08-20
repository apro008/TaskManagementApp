# TaskFlow

Cross-platform task manager built with React Native. Tasks are written to a local
SQLite database first and pushed to Firestore whenever the device is online, so
the app stays fully usable with no connection.

## Requirements checklist

| Requirement | Status | Where |
| --- | --- | --- |
| Sign up and login with Firebase Auth (email/password) | Done | `src/features/auth/services/authService.ts` |
| Persist user session | Done | `onAuthStateChanged` in `src/app/useBootstrap.ts` |
| Add, edit, delete tasks | Done | `src/features/tasks/store/tasksSlice.ts` |
| Mark tasks complete or incomplete | Done | `toggleTask` in `src/features/tasks/store/tasksSlice.ts` |
| Stored locally and synced to Firestore when online | Done | `taskRepository.ts` and `taskRemote.ts` |
| Local DB (SQLite) | Done | `src/db/` using `@op-engineering/op-sqlite` |
| Offline changes sync when connectivity returns | Done | `src/app/useSync.ts` and `syncEngine.ts` |
| Local push for task reminders | Done | `src/services/notifications/reminders.ts` |
| Server push with FCM (bonus) | Done, Android only | `src/services/notifications/messaging.ts` |
| Support dev, staging and production | Done | Gradle flavours, Xcode schemes, three `.env` files |
| Dark and light mode | Done | `src/theme/` |
| Redux Toolkit | Done | `src/store/` and the three feature slices |
| React Navigation with Auth Stack and App Stack | Done | `src/navigation/` |
| Scalable, modular folder structure | Done | Feature folders under `src/features/` |
| FlatList optimisations | Done | `getItemLayout`, memoised rows, tuned batching, debounced search |
| Lazy loading of screens | Done | `src/navigation/lazy.tsx` |

Two rows carry a caveat rather than a plain Done:

- **FCM is demonstrable on Android only.** The code is complete on both platforms,
  but iOS push on a real device needs an APNs key, and the simulator cannot
  receive push at all.
- **Only dev has real Firebase credentials.** All three environments build and
  install side by side; staging and production ship placeholder config files.

## Architecture choice

Three decisions shaped the project.

**Feature-first folders, not type-first.** Everything a feature needs (screens,
state, services, components) lives in one folder, so a feature can be moved or
removed without touching the rest of the app. A top-level `screens/`, `services/`,
`store/` split would mean every change to tasks touching four distant directories.

**The local database is the single source of truth, not a cache.** Firestore's
own offline persistence was the alternative and was rejected: it makes the
network the primary path with a cache behind it, so offline becomes a degraded
mode. Writing to SQLite first and syncing separately makes offline the normal
case, and the UI never waits on a network call. The cost is owning the sync
logic, which is `syncEngine.ts`.

**Redux Toolkit for shared state, with no data-fetching layer.** Thunks call the
repository directly. RTK Query was considered and does not fit: it assumes the
server is authoritative and manages a request cache, but here the server is a
replica the app pushes to in the background.

```
src/
  app/            App entry, bootstrap and sync hooks
  components/     Shared UI used by more than one feature
  config/         Environment values and constants
  db/             SQLite connection and schema
  features/
    auth/         Login, sign up, auth slice, auth service
    settings/     Theme and account screen, settings slice
    tasks/        Task list and editor, task slice, repository, sync engine
  navigation/     Root, auth and app stacks
  services/       Firebase, connectivity, notifications
  store/          Redux store and typed hooks
  theme/          Palettes and themed component variants
  utils/          Small helpers
```

### Data flow

The UI never talks to Firestore directly.

```
Screen -> Redux thunk -> taskRepository (SQLite) -> Redux store -> Screen
                                |
                                v
                          syncEngine -> Firestore
```

Every write goes to SQLite first and is marked `synced = 0`. The sync engine
picks up unsynced rows and pushes them, then pulls anything changed remotely
since the last successful pull.

### Sync rules

- Writes go to SQLite immediately, so the UI never waits on the network
- Deletes are tombstones (`deleted = 1`) so other devices learn about them, and
  are removed locally once the tombstone has synced
- Conflicts resolve last write wins, compared on `updated_at`
- A remote row is only applied locally if the local row has no unsynced changes
- Sync runs on login, on app foreground, when connectivity returns, after every
  local change, and on pull to refresh. There is no polling timer, so an idle
  app makes no Firestore requests

## Libraries used

| Library | Why |
| --- | --- |
| `@reduxjs/toolkit`, `react-redux` | State management, required by the brief |
| `@react-navigation/native`, `native-stack` | Navigation, native stack for native transitions |
| `@react-native-firebase/app`, `auth`, `firestore`, `messaging` | Auth, remote store, push |
| `@op-engineering/op-sqlite` | Local database. JSI based, synchronous, no bridge overhead |
| `@react-native-community/netinfo` | Connectivity detection, drives the sync trigger |
| `@notifee/react-native` | Local scheduled notifications for reminders |
| `react-native-config` | Reads the per environment `.env` file into native and JS |
| `@react-native-async-storage/async-storage` | Persists the theme choice |
| `@react-native-community/datetimepicker` | Due date and time selection |
| `dayjs` | Date formatting and comparison, small and immutable |
| `lodash` | `debounce` on search input, `countBy` for filter counts |

`op-sqlite` was picked over `react-native-sqlite-storage` because it is JSI based
rather than callback based over the bridge, it is actively maintained, and it
ships TypeScript types.

## How to run the app in each environment

Requirements: Node 22+, Ruby with Bundler, Xcode 16+, JDK 17, Android SDK.

```bash
npm install
bundle install
npm run pods
```

### Firebase config

Development is wired to a real Firebase project. Replace the placeholder files
before running staging or production against a live backend.

| Environment | Bundle id (both platforms) | Android file | iOS file |
| --- | --- | --- | --- |
| dev | `com.taskmanagementapp.dev` | `android/app/src/dev/google-services.json` | `ios/firebase/dev/GoogleService-Info.plist` |
| staging | `com.taskmanagementapp.staging` | `android/app/src/staging/google-services.json` | `ios/firebase/staging/GoogleService-Info.plist` |
| production | `com.taskmanagementapp` | `android/app/src/production/google-services.json` | `ios/firebase/production/GoogleService-Info.plist` |

Enable Email/Password sign in, create a Firestore database, and publish rules
matching how the app stores data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

On iOS the correct plist is copied into the app bundle at build time by the
`Copy Firebase config` build phase, keyed on the `FIREBASE_ENV` build setting.
On Android the Gradle plugin picks the file from the flavour source set.

### Running

Start Metro once, then run whichever environment you want in a second terminal.

```bash
npm start
```

| Environment | Env file | Android | iOS |
| --- | --- | --- | --- |
| development | `.env.development` | `npm run android:dev` | `npm run ios:dev` |
| staging | `.env.staging` | `npm run android:staging` | `npm run ios:staging` |
| production | `.env.production` | `npm run android:prod` | `npm run ios:prod` |

Each script selects the matching Android product flavour or iOS scheme, and that
selection pulls in the right `.env` file, Firebase config, application id and
launcher icon. Nothing is switched by hand, and because the three builds have
different application ids they install side by side on one device.

`npm run android` and `npm run ios` are aliases for the dev variants.

Release builds write an APK to `android/app/build/outputs/apk/<flavour>/release/`
and bundle the JavaScript, so they run without Metro. For iOS, archive the
matching scheme in Xcode.

```bash
npm run android:build:prod
```

Checks:

```bash
npm run typecheck
npm run lint
npm test
```

## Known limitations

- Conflict resolution is last write wins on the whole document. Two devices
  editing different fields of the same task at the same time will lose one set
  of edits. Field level merge would need a per field timestamp.
- Sync pulls with `where('updatedAt', '>', lastPull)` and relies on device
  clocks. A device with a badly wrong clock can write a timestamp that other
  devices skip. A server timestamp with a separate ordering field would fix it.
- The push and pull batches are capped by `SYNC_BATCH_SIZE`. A very large backlog
  needs more than one sync pass to drain.
- Sync only runs while the app is running. There is no background fetch task, so
  a device that goes online while the app is closed syncs on next launch.
- FCM is wired up and receives messages, but there is no server sending them.
  Settings has a Notification test section on builds where `ENABLE_DEV_MENU` is
  on, which fires a notification through the same code the foreground push
  handler uses and shows the device's FCM token. That covers rendering, the
  channel and permissions, but not the delivery path.
- iOS push on a real device also needs an APNs authentication key uploaded to the
  Firebase project under Cloud Messaging. Without it, FCM only reaches Android.
  The simulator cannot receive push at all.
- `react-native-config` 1.6.1 does not register its native module correctly on
  React Native 0.87. Its `codegenConfig` declares the module as `RNCConfig` while
  the class and the JavaScript spec both use `RNCConfigModule`, so the app fails
  with `Unable to find module for RNCConfig`.
  `patches/react-native-config+1.6.1.patch` aligns the name and `patch-package`
  reapplies it on install. The Podfile also sets `RCT_NEW_ARCH_ENABLED` so the
  library's TurboModule method is compiled at all. 1.6.1 is the latest published
  version, so there is no upstream fix to take yet.
