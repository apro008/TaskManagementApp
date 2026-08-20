# TaskFlow

Cross-platform task manager built with React Native. Tasks are stored in a local
SQLite database first and pushed to Firestore whenever the device is online, so
the app stays fully usable with no connection.

The four things the assignment asks this README to explain:
[architecture choice](#architecture-choice), [libraries used](#libraries-used),
[how to run the app in each environment](#how-to-run-the-app-in-each-environment),
and [known limitations](#known-limitations).

## Features

- Email/password sign up and login with Firebase Auth, session persisted across restarts
- Add, edit, delete tasks, and mark them complete or incomplete
- Local SQLite storage with background sync to Firestore
- Offline edits queue up and sync automatically when connectivity returns
- Local reminder notifications for tasks with a due date
- Push notifications through Firebase Cloud Messaging
- Separate dev, staging and production builds
- Light and dark theme, following the system setting by default

## Requirements checklist

### Features

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

### Technical expectations

| Requirement | Status | Where |
| --- | --- | --- |
| Scalable, modular folder structure | Done | Feature folders under `src/features/` |
| FlatList optimisations | Done | `getItemLayout`, memoised rows, tuned batching |
| Lazy loading of screens | Done | `src/navigation/lazy.tsx` |

### Documentation

| Requirement | Status |
| --- | --- |
| README: architecture choice | Done |
| README: libraries used | Done |
| README: how to run in each environment | Done |
| README: known limitations | Done |
| Sample `.env` file per environment | Done |

Two items are marked with a caveat rather than a plain Done:

- **FCM is demonstrable on Android only.** The code is complete on both platforms, but
  iOS push on a real device needs an APNs key uploaded to the Firebase project, and the
  simulator cannot receive push at all.
- **Only the dev environment has real Firebase credentials.** All three environments
  build and install side by side, but staging and production still ship placeholder
  config files. See Known limitations.

## Architecture choice

Three decisions shaped the project.

**Feature-first folders, not type-first.** Everything a feature needs (screens,
state, services, components) lives in one folder, so a feature can be moved or
removed without touching the rest of the app. A `screens/`, `services/`,
`store/` split at the top level would have meant every change to tasks touching
four distant directories.

**The local database is the single source of truth, not a cache.** Firestore's
own offline persistence was the alternative and was rejected: it makes the
network the primary path with a cache behind it, so offline becomes a degraded
mode. Writing to SQLite first and syncing separately makes offline the normal
case and the UI never waits on a network call. The cost is owning the sync
logic, which is `syncEngine.ts`.

**Redux Toolkit for shared state, with no data-fetching layer.** Thunks call the
repository directly. RTK Query was considered and does not fit: it assumes a
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
  theme/          Colours, spacing, theme provider
  utils/          Small helpers
```

### Data flow

The local database is the single source of truth. The UI never talks to
Firestore directly.

```
Screen -> Redux thunk -> taskRepository (SQLite) -> Redux store -> Screen
                                |
                                v
                          syncEngine -> Firestore
```

Every write goes to SQLite first and is marked `synced = 0`. The sync engine
picks up unsynced rows and pushes them, then pulls anything changed remotely
since the last successful pull. This keeps the UI instant and makes offline the
normal case rather than an error state.

### Sync rules

- Writes go to SQLite immediately, so the UI never waits on the network
- Deletes are tombstones (`deleted = 1`) so other devices learn about them, and
  are removed locally once the tombstone has synced
- Conflicts resolve last write wins, compared on `updated_at`
- A remote row is only applied locally if the local row has no unsynced changes
- Sync runs on login, on app foreground, when connectivity returns, after every
  local change, and on pull to refresh. There is no polling timer, so an idle app
  makes no Firestore requests

### State

Redux Toolkit holds three slices: `auth`, `tasks` and `settings`. Tasks use
`createEntityAdapter` for normalised lookups, and filtering and search run
through memoised selectors so the list does not recompute on unrelated updates.

### Theming

`theme/colors.ts` holds two palettes, light and dark, with identical keys.
`theme/variants.ts` turns whichever palette is active into named roles: a chip
has `on` and `off`, a button has `primary`, `secondary` and `danger`, a task row
has `done` and `open`. `ThemeProvider` builds that map inside the same `useMemo`
that picks the palette, so it is rebuilt when the theme changes and never during
a render.

Components therefore never decide a colour. They name a state and index into it:

```tsx
const { variants } = useTheme();
const state = active ? 'on' : 'off';

<Pressable style={[styles.chip, variants.chip[state]]}>
```

Layout stays in each component's own `StyleSheet.create`; only the themed part
comes from `variants`. That keeps every light/dark pair in one file, and the
style objects are stable references rather than fresh literals built on every
render.

Screens still read `theme.colors.*` directly. A one-off colour on one screen is
not a design system role, and inventing a name for it costs more than it saves.

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

`op-sqlite` was picked over `react-native-sqlite-storage` because it is JSI
based rather than callback based over the bridge, it is actively maintained, and
it ships TypeScript types.

## Performance

- `FlatList` uses `getItemLayout` with a fixed row height, so scroll position is
  known without measuring
- Rows are `React.memo` components and all list callbacks are `useCallback`, so
  changing one task does not re-render the whole list
- `initialNumToRender`, `maxToRenderPerBatch`, `windowSize` and
  `removeClippedSubviews` are tuned for long lists
- Every screen is loaded with `React.lazy` behind a `Suspense` fallback, so the
  initial bundle only evaluates what the first screen needs
- Filtering and counts run through `createSelector`, not inside render
- Search input is debounced with `lodash/debounce`, so typing does not dispatch
  and re-filter on every keystroke

## Setup

Requirements: Node 22+, Ruby with Bundler, Xcode 16+, JDK 17, Android SDK.

```bash
npm install
bundle install
npm run pods
```

### Firebase config

Development is wired to a real Firebase project. Staging and production ship
placeholder config files so the project still builds; replace them with your own
before running those environments against a live backend.

Create three Firebase projects (or three apps in one project) and download:

| Environment | Android bundle id | iOS bundle id | Android file | iOS file |
| --- | --- | --- | --- | --- |
| dev | `com.taskmanagementapp.dev` | `com.taskmanagementapp.dev` | `android/app/src/dev/google-services.json` | `ios/firebase/dev/GoogleService-Info.plist` |
| staging | `com.taskmanagementapp.staging` | `com.taskmanagementapp.staging` | `android/app/src/staging/google-services.json` | `ios/firebase/staging/GoogleService-Info.plist` |
| production | `com.taskmanagementapp` | `com.taskmanagementapp` | `android/app/src/production/google-services.json` | `ios/firebase/production/GoogleService-Info.plist` |

Enable Email/Password sign in and create a Firestore database in each project.

Firestore rules that match how the app stores data:

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
`Copy Firebase config` build phase, based on the `FIREBASE_ENV` build setting.
On Android the Gradle plugin picks the file from the flavour source set.

## Environments

Three environments are wired end to end: a `.env` file, an Android product
flavour, an iOS scheme and build configuration, and its own Firebase config.

| Environment | Env file | Android flavour | iOS scheme | App id |
| --- | --- | --- | --- | --- |
| development | `.env.development` | `dev` | TaskManagementApp | `com.taskmanagementapp.dev` |
| staging | `.env.staging` | `staging` | TaskManagementApp Staging | `com.taskmanagementapp.staging` |
| production | `.env.production` | `production` | TaskManagementApp Production | `com.taskmanagementapp` |

All three can be installed side by side on one device.

### Icon and splash

Each environment ships its own launcher icon, so three installs on one home
screen stay apart. The mark is a white check on a flat tint: amber for
development, purple for staging, blue for production.

| Platform | Where the icons live |
| --- | --- |
| Android | `android/app/src/<flavour>/res/mipmap-*`, with the adaptive icon tint in that flavour's `values/colors.xml` |
| iOS | `AppIcon-Dev`, `AppIcon-Staging` and `AppIcon` in `Images.xcassets`, picked per build configuration by `ASSETCATALOG_COMPILER_APPICON_NAME` |

The launch screen is brand blue in every environment. Android draws it from
`AppTheme.SplashScreen`, which is `drawable/splash_screen.xml` below API 31 and
the platform splash attributes in `values-v31` above it; `MainActivity` swaps
back to `AppTheme` in `onCreate` so the splash drawable is not left sitting
behind the app. iOS draws it from `LaunchScreen.storyboard`.

`src/components/Splash.tsx` picks up where the native launch screen stops, on
the same background with the logo in the same place, and holds until the
database, theme, notifications and the first Firebase auth callback have all
settled. It is the only screen that names the environment, and only outside
production.

### Adding a value to the environment

1. Add the key to all three `.env.*` files and to `.env.example`
2. Add the key to `NativeConfig` in `src/types/config.d.ts`
3. Read it through `src/config/env.ts`, never through `Config` directly

Reading everything through `env.ts` means values are parsed and defaulted in one
place, so a missing key cannot crash the app at an unrelated call site.

## How to run the app in each environment

Start Metro once, then run whichever environment you want in a second terminal.

```bash
npm start
```

| Environment | Android | iOS |
| --- | --- | --- |
| development | `npm run android:dev` | `npm run ios:dev` |
| staging | `npm run android:staging` | `npm run ios:staging` |
| production | `npm run android:prod` | `npm run ios:prod` |

Each script selects the matching Android product flavour or iOS scheme, and that
selection is what pulls in the right `.env` file, Firebase config, application
id and launcher icon. Nothing is switched by hand, and because the three builds
have different application ids they install side by side on one device.

`npm run android` and `npm run ios` are aliases for the dev variants.

Release builds:

```bash
npm run android:build:dev
npm run android:build:prod
```

Both write an APK to `android/app/build/outputs/apk/<flavour>/release/`. Unlike
the debug variants these bundle the JavaScript, so they run without Metro. For
iOS, archive the matching scheme in Xcode; each scheme's archive action already
points at the right build configuration.

## Checks

```bash
npm run typecheck
npm run lint
npm test
```

## Known limitations

- Only the development environment is connected to a real Firebase project. The
  staging and production `google-services.json` and `GoogleService-Info.plist`
  files are still placeholders, so auth and sync will not work in those builds
  until they are replaced.
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
  on. It fires a notification through the same code the foreground push handler
  uses, and shows the device's FCM token for pasting into the Firebase console
  or the FCM API. That covers rendering, the channel and permissions, but not
  the delivery path, so an end to end check still needs a real message sent to
  that token.
- iOS push on a real device also needs an APNs authentication key uploaded to the
  Firebase project under Cloud Messaging. Without it, FCM only reaches Android.
  The simulator cannot receive push at all, so local reminders are the only
  notification path testable there.
- `react-native-config` 1.6.1 does not register its native module correctly on
  React Native 0.87. Its `codegenConfig` declares the module as `RNCConfig` while
  the class and the JavaScript spec both use `RNCConfigModule`, so the generated
  main queue setup provider asks for a name nothing answers to and the app fails
  with `Unable to find module for RNCConfig`. `patches/react-native-config+1.6.1.patch`
  aligns the name and `patch-package` reapplies it on install. The iOS Podfile also
  sets `RCT_NEW_ARCH_ENABLED` so the library's TurboModule method is compiled at all.
  1.6.1 is the latest published version, so there is no upstream fix to take yet.




