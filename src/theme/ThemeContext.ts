import { createContext, useContext } from 'react';

import { lightTheme } from './lightTheme';
import type { Theme, ThemeMode, ThemePreference } from './types';

export type ThemeContextValue = {
  /** The resolved theme currently in effect. */
  theme: Theme;
  /** `light` or `dark`, after resolving `system` against device appearance. */
  mode: ThemeMode;
  /** What the user selected, which may be `system`. */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** False until the stored preference has been read (see ThemeProvider). */
  isHydrated: boolean;
};

/**
 * Deliberately defaulted rather than left undefined: a component rendered
 * outside the provider (a test, a Storybook story) gets the light theme
 * instead of a crash. `useTheme` warns about that case in development.
 */
export const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  mode: 'light',
  preference: 'system',
  setPreference: () => undefined,
  isHydrated: false,
});

ThemeContext.displayName = 'ThemeContext';

/**
 * Access the active theme (AGENTS.md 10).
 *
 * This is the only supported way to read design tokens from a component.
 * Never re-detect dark mode with useColorScheme at a call site.
 */
export const useTheme = (): ThemeContextValue => useContext(ThemeContext);
