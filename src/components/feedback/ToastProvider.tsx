import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@components/common/AppText';
import { AppPressable, Row } from '@components/primitives';
import { useTheme } from '@theme';

import { ToastContext } from './ToastContext';
import type {
  Toast,
  ToastContextValue,
  ToastOptions,
  ToastTone,
} from './toastTypes';

const DEFAULT_DURATION = 3000;

/**
 * Hosts the single visible toast (AGENTS.md 21).
 *
 * One toast at a time by design: stacking them buries the newest message and
 * competes with whatever the user is actually doing.
 */
export const ToastProvider = ({ children }: PropsWithChildren) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<Toast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimer();
    setToast(null);
  }, [clearTimer]);

  const show = useCallback(
    (options: ToastOptions) => {
      // Replacing rather than queueing: a stale timer from the previous toast
      // would otherwise dismiss this one early.
      clearTimer();
      setToast({ ...options, id: String(Date.now()) });

      const duration = options.duration ?? DEFAULT_DURATION;
      if (duration > 0) {
        timerRef.current = setTimeout(() => setToast(null), duration);
      }
    },
    [clearTimer],
  );

  // A pending timer firing after unmount would set state on a dead tree.
  useEffect(() => clearTimer, [clearTimer]);

  const value = useMemo<ToastContextValue>(
    () => ({ show, dismiss }),
    [show, dismiss],
  );

  const toneColors: Record<ToastTone, { background: string; text: string }> = {
    neutral: {
      background: theme.colors.secondary,
      text: theme.colors.text.inverse,
    },
    success: {
      background: theme.colors.success,
      text: theme.colors.text.onPrimary,
    },
    warning: {
      background: theme.colors.warning,
      text: theme.colors.text.onPrimary,
    },
    error: {
      background: theme.colors.error,
      text: theme.colors.text.onPrimary,
    },
  };

  const tone = toneColors[toast?.tone ?? 'neutral'];

  return (
    <ToastContext value={value}>
      {children}

      {toast != null && (
        <Animated.View
          // Announced without stealing focus from whatever the user is doing.
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          entering={FadeInDown}
          exiting={FadeOutDown}
          style={[
            styles.container,
            {
              bottom: insets.bottom + theme.spacing.lg,
              marginHorizontal: theme.spacing.lg,
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              backgroundColor: tone.background,
              zIndex: theme.zIndex.toast,
              ...theme.shadows.md,
            },
          ]}
          testID="toast">
          <Row gap="md">
            <AppText style={{ color: tone.text, flex: 1 }} variant="bodySmall">
              {toast.message}
            </AppText>

            {toast.actionLabel != null && (
              <AppPressable
                accessibilityLabel={toast.actionLabel}
                accessibilityRole="button"
                onPress={() => {
                  toast.onAction?.();
                  dismiss();
                }}
                testID="toast-action">
                <AppText style={{ color: tone.text }} variant="label">
                  {toast.actionLabel}
                </AppText>
              </AppPressable>
            )}
          </Row>
        </Animated.View>
      )}
    </ToastContext>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 0, right: 0 },
});
