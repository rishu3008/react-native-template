import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { useTheme, type Spacing } from '@theme';

export type AppScreenProps = {
  children: React.ReactNode;
  /** Wrap content in a ScrollView. */
  scrollable?: boolean;
  /** Safe-area edges to inset. Bottom is excluded by default so tab bars sit flush. */
  edges?: readonly Edge[];
  padding?: Spacing;
  backgroundColor?: string;
  /** Dismiss the keyboard when the background is tapped. */
  dismissKeyboardOnTap?: boolean;
  keyboardAvoiding?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * The screen container every screen uses (AGENTS.md 26, 36).
 *
 * Safe areas, keyboard avoidance, scrolling and keyboard dismissal are solved
 * once here rather than repeated per screen. Screens that opt out of any of it
 * pass a flag; they do not reimplement it.
 */
export const AppScreen = ({
  children,
  scrollable = false,
  edges = ['top', 'left', 'right'],
  padding = 'lg',
  backgroundColor,
  dismissKeyboardOnTap = false,
  keyboardAvoiding = true,
  style,
  testID,
}: AppScreenProps) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const padded: ViewStyle = {
    flex: 1,
    padding: theme.spacing[padding],
    paddingTop: edges.includes('top')
      ? insets.top + theme.spacing[padding]
      : theme.spacing[padding],
    paddingBottom: edges.includes('bottom')
      ? insets.bottom + theme.spacing[padding]
      : theme.spacing[padding],
    paddingLeft: edges.includes('left')
      ? insets.left + theme.spacing[padding]
      : theme.spacing[padding],
    paddingRight: edges.includes('right')
      ? insets.right + theme.spacing[padding]
      : theme.spacing[padding],
  };

  const body = scrollable ? (
    <ScrollView
      contentContainerStyle={padded}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}>
      {children}
    </ScrollView>
  ) : (
    <View style={padded}>{children}</View>
  );

  const withDismiss = dismissKeyboardOnTap ? (
    <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
      {body}
    </TouchableWithoutFeedback>
  ) : (
    body
  );

  const content = keyboardAvoiding ? (
    // iOS needs padding to lift content above the keyboard; on Android the
    // window already resizes, and using padding there double-counts.
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}>
      {withDismiss}
    </KeyboardAvoidingView>
  ) : (
    withDismiss
  );

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: backgroundColor ?? theme.colors.background,
        },
        style,
      ]}
      testID={testID}>
      {content}
    </View>
  );
};
