import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Splash } from '../components/Splash';
import { RootNavigator } from '../navigation/RootNavigator';
import { store } from '../store';
import { useAppSelector } from '../store/hooks';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { useBootstrap } from './useBootstrap';
import { useSync } from './useSync';

function Root() {
  const theme = useTheme();
  const booted = useBootstrap();
  const authReady = useAppSelector(state => state.auth.ready);
  useSync();

  if (!booted || !authReady) return <Splash />;

  return (
    <>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Root />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
