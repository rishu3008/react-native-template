import {
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppPressable, Row } from '@components/primitives';
import { useTheme } from '@theme';

import { AppText, type AppTextColor } from './AppText';

export type AppButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';
export type AppButtonSize = 'small' | 'medium' | 'large';

export type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Prefixed because `Button` is a React Native export (rule 8.1).
 *
 * A loading button stays mounted at the same size and swaps its label for a
 * spinner, so pressing it does not make the layout jump. It is disabled while
 * loading, and reports `busy` to assistive technology (rule 28).
 */
export const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftElement,
  rightElement,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}: AppButtonProps) => {
  const { theme } = useTheme();
  const isInteractive = !disabled && !loading;

  const height = theme.sizes.control[size];
  const paddingHorizontal =
    size === 'small' ? theme.spacing.md : theme.spacing.lg;

  const containerByVariant: Record<AppButtonVariant, ViewStyle> = {
    primary: { backgroundColor: theme.colors.primary },
    secondary: { backgroundColor: theme.colors.secondary },
    outline: {
      backgroundColor: theme.colors.transparent,
      borderWidth: theme.sizes.border.hairline,
      borderColor: theme.colors.borderStrong,
    },
    ghost: { backgroundColor: theme.colors.transparent },
    danger: { backgroundColor: theme.colors.error },
  };

  const labelColorByVariant: Record<AppButtonVariant, AppTextColor> = {
    primary: 'onPrimary',
    secondary: 'inverse',
    outline: 'primary',
    ghost: 'primary',
    danger: 'onPrimary',
  };

  const labelColor = disabled ? 'disabled' : labelColorByVariant[variant];

  return (
    <AppPressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      disabled={!isInteractive}
      onPress={onPress}
      style={[
        {
          height,
          paddingHorizontal,
          borderRadius: theme.radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          ...containerByVariant[variant],
          ...(disabled && {
            backgroundColor:
              variant === 'outline' || variant === 'ghost'
                ? theme.colors.transparent
                : theme.colors.disabled,
            borderColor: theme.colors.border,
          }),
          ...(fullWidth && { alignSelf: 'stretch' }),
        },
        style,
      ]}
      testID={testID}>
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'ghost'
              ? theme.colors.primary
              : theme.colors.text.onPrimary
          }
          size="small"
          testID="app-button-spinner"
        />
      ) : (
        <Row gap="sm">
          {leftElement}
          <AppText color={labelColor} variant="button">
            {title}
          </AppText>
          {rightElement}
        </Row>
      )}
    </AppPressable>
  );
};
