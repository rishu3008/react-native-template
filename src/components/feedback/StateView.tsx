import type { StyleProp, ViewStyle } from 'react-native';

import { AppButton } from '@components/common/AppButton';
import { AppText } from '@components/common/AppText';
import { Stack } from '@components/primitives';
import { useTheme } from '@theme';

export type StateViewTone = 'neutral' | 'error' | 'success';

export type StateViewProps = {
  title: string;
  description?: string;
  tone?: StateViewTone;
  /** Icon, illustration or any custom visual above the title. */
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Shared layout behind EmptyState, ErrorState and SuccessState.
 *
 * Those three differ only in tone and default copy, so they compose this
 * rather than duplicating the layout three times (rule 60).
 */
export const StateView = ({
  title,
  description,
  tone = 'neutral',
  icon,
  actionLabel,
  onAction,
  style,
  testID,
}: StateViewProps) => {
  const { theme } = useTheme();

  return (
    <Stack
      accessibilityRole="summary"
      align="center"
      gap="md"
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.xl,
        },
        style,
      ]}
      testID={testID}>
      {icon}

      <AppText
        align="center"
        color={tone === 'error' ? 'error' : 'primary'}
        variant="heading3">
        {title}
      </AppText>

      {description != null && (
        <AppText align="center" color="secondary" variant="body">
          {description}
        </AppText>
      )}

      {actionLabel != null && onAction != null && (
        <AppButton
          onPress={onAction}
          title={actionLabel}
          variant={tone === 'error' ? 'primary' : 'outline'}
        />
      )}
    </Stack>
  );
};
