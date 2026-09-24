import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';

import { storageKeys } from '@constants';
import { storageService } from '@services';
import {
  darkTheme,
  lightTheme,
  ThemeContext,
  type ThemeContextValue,
  type ThemeMode,
  type ThemePreference,
} from '@theme';

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

/**
 * Owns theme state and persists the user's choice (AGENTS.md 10).
 *
 * Lives in the app layer rather than in `@theme` because it depends on
 * storage, and rule 6 forbids the theme layer from reaching into services.
 * `@theme` stays a pure, side-effect-free token and context module.
 */
export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const stored = await storageService.getString(
        storageKeys.themePreference,
      );

      // Guard against a value written by an older build, or hand-edited
      // storage: an unrecognised string must not become the active theme.
      if (!cancelled && isThemePreference(stored)) {
        setPreferenceState(stored);
      }

      if (!cancelled) {
        setIsHydrated(true);
      }
    };

    restore().catch(() => {
      // getString already swallows read failures, so this only fires if
      // setState throws after unmount. Marking hydrated anyway keeps the app
      // from hanging behind the gate forever.
      if (!cancelled) {
        setIsHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    // Applied immediately; persistence is a side effect the UI never waits on.
    setPreferenceState(next);

    storageService.setString(storageKeys.themePreference, next).catch(() => {
      // Best effort. A failed write means the choice is not remembered next
      // launch, which is not worth breaking the current session over. The
      // logging phase routes this to logger.warn rather than dropping it.
    });
  }, []);

  const mode: ThemeMode =
    preference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: mode === 'dark' ? darkTheme : lightTheme,
      mode,
      preference,
      setPreference,
      isHydrated,
    }),
    [mode, preference, setPreference, isHydrated],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
};
