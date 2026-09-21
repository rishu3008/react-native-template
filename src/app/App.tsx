import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PlaygroundScreen } from '@features';
import { useTheme } from '@theme';

import { ThemeProvider } from './providers';

/**
 * Renders the status bar against the active theme and hosts the app content.
 *
 * Separate from App because it must sit inside ThemeProvider to read the
 * theme -- a provider cannot consume its own context.
 */
const AppContent = () => {
  const { mode, isHydrated } = useTheme();

  // Nothing is rendered until the stored theme preference has been read.
  // Rendering first would show one frame of the wrong theme to anyone who
  // chose a non-system preference. The native splash screen stays up instead.
  if (!isHydrated) {
    return null;
  }

  return (
    <>
      {/*
        No backgroundColor: React Native 0.87 removed it, and under
        edge-to-edge the status bar is transparent over app content anyway.
      */}
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
      />
      <PlaygroundScreen />
    </>
  );
};

const App = () => (
  <SafeAreaProvider>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </SafeAreaProvider>
);

export default App;
