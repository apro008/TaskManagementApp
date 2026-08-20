import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import { lazyScreen } from './lazy';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

const TaskList = lazyScreen(
  () => import('../features/tasks/screens/TaskListScreen'),
);
const TaskEditor = lazyScreen(
  () => import('../features/tasks/screens/TaskEditorScreen'),
);
const Settings = lazyScreen(
  () => import('../features/settings/screens/SettingsScreen'),
);

export function AppStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="TaskList"
        component={TaskList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TaskEditor"
        component={TaskEditor}
        options={{ title: 'Task', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}
