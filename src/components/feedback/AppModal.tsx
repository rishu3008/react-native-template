import {
  Modal,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@components/common/AppText';
import { AppPressable, Row } from '@components/primitives';
import { useTheme } from '@theme';

export type AppModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Tapping the scrim closes the modal. Turn off for destructive flows. */
  dismissOnBackdropPress?: boolean;
  showCloseButton?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Prefixed because `Modal` is a React Native export (rule 8.1).
 *
 * Adapter over the platform modal (rule 48). Built on RN's own Modal rather
 * than a library: it already handles the Android hardware back button and
 * native focus containment, which is most of what a modal has to get right.
 *
 * The scrim is a sibling of the panel, not its parent, so a tap inside the
 * panel cannot bubble out and close the modal.
 */
export const AppModal = ({
  visible,
  onClose,
  title,
  children,
  dismissOnBackdropPress = true,
  showCloseButton = true,
  style,
  testID,
}: AppModalProps) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="fade"
      // Android's hardware back must close the modal, not the screen behind
      // it. RN only routes it here if onRequestClose is set.
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Pressable
          accessibilityElementsHidden
          accessibilityLabel="Close"
          importantForAccessibility="no-hide-descendants"
          onPress={dismissOnBackdropPress ? onClose : undefined}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.overlay,
          }}
          testID="app-modal-backdrop"
        />

        <View
          accessibilityViewIsModal
          accessible={false}
          style={[
            {
              marginHorizontal: theme.spacing.xl,
              marginTop: insets.top,
              marginBottom: insets.bottom,
              padding: theme.spacing.lg,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.surfaceElevated,
              ...theme.shadows.lg,
            },
            style,
          ]}
          testID={testID}>
          {(title != null || showCloseButton) && (
            <Row
              justify="space-between"
              style={{ marginBottom: theme.spacing.md }}>
              {title != null ? (
                <AppText
                  accessibilityRole="header"
                  style={{ flex: 1 }}
                  variant="heading3">
                  {title}
                </AppText>
              ) : (
                <View style={{ flex: 1 }} />
              )}

              {showCloseButton && (
                <AppPressable
                  accessibilityLabel="Close"
                  accessibilityRole="button"
                  onPress={onClose}
                  testID="app-modal-close">
                  <AppText color="secondary" variant="heading3">
                    ✕
                  </AppText>
                </AppPressable>
              )}
            </Row>
          )}

          {children}
        </View>
      </View>
    </Modal>
  );
};
