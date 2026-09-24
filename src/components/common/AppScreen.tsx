import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
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

  // Padding only. The sizing rule differs per branch below, so it is not
  // baked in here.
  //
  // Left/Right rather than Start/End is deliberate here and not a rule 29
  // violation: safe-area insets describe physical screen edges. The notch
  // stays on the physical left under RTL, so mapping insets through
  // Start/End would apply them to the wrong side.
  const padded: ViewStyle = {
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
      // flexGrow, never flex. `flex: 1` on a content container sizes the
      // content to exactly the viewport, so it can never overflow and the
      // view never scrolls. flexGrow fills the screen when content is short
      // and expands past it when content is tall.
      contentContainerStyle={[padded, { flexGrow: 1 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={styles.fill}>
      {children}
    </ScrollView>
  ) : (
    <View style={[padded, styles.fill]}>{children}</View>
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
      style={styles.fill}>
      {withDismiss}
    </KeyboardAvoidingView>
  ) : (
    withDismiss
  );

  return (
    <View
      style={[
        styles.fill,
        { backgroundColor: backgroundColor ?? theme.colors.background },
        style,
      ]}
      testID={testID}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
