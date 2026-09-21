import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@components';
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
  // GestureHandlerRootView must wrap the whole tree, and must have flex: 1 --
  // without the flex it collapses to zero height and nothing renders.
  <GestureHandlerRootView style={styles.root}>
    <SafeAreaProvider>
      <ThemeProvider>
        {/* BottomSheetModalProvider hosts the portal AppBottomSheet renders
            into, which is what keeps sheets from being clipped by layout. */}
        <BottomSheetModalProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </BottomSheetModalProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default App;
