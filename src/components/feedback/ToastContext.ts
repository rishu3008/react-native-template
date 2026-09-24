import { createContext, useContext } from 'react';

import type { ToastContextValue } from './toastTypes';

/**
 * Defaulted to no-ops so a component rendered outside ToastProvider -- a
 * test, an isolated story -- degrades to silence rather than crashing.
 */
export const ToastContext = createContext<ToastContextValue>({
  show: () => undefined,
  dismiss: () => undefined,
});

ToastContext.displayName = 'ToastContext';

/**
 * Show a transient message (AGENTS.md 21).
 *
 * Imperative on purpose: toasts are raised from event handlers and services,
 * not rendered inline by the screen that triggers them.
 */
export const useToast = (): ToastContextValue => useContext(ToastContext);
