import { useId, useState } from 'react';
import {
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { Row, Stack } from '@components/primitives';
import { useTheme } from '@theme';

import { AppText } from './AppText';

export type AppInputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Text field with label, helper text and error state (AGENTS.md 37).
 *
 * Accessibility is built in rather than left to callers (rule 28): the field
 * is labelled, marked required and invalid where applicable, and the error or
 * helper text is wired up as its description, so a screen reader announces
 * why a field is rejected instead of just "invalid".
 *
 * Validation rules live in the form layer; this component only renders the
 * state it is given.
 */
export const AppInput = ({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  leftElement,
  rightElement,
  containerStyle,
  onFocus,
  onBlur,
  editable,
  ...rest
}: AppInputProps) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const descriptionId = useId();

  // Label, input text and helper/error text share one left edge. The field's
  // border and inner padding push the input text inward, so the label and
  // description are inset to match -- otherwise the three sit on two
  // different edges. Start/End rather than Left/Right to stay RTL-safe
  // (AGENTS.md 29).
  const textInset = theme.spacing.md + theme.sizes.border.hairline;

  const hasError = error != null && error.length > 0;
  const isEditable = editable ?? !disabled;
  const description = hasError ? error : helperText;

  const borderColor = hasError
    ? theme.colors.error
    : isFocused
      ? theme.colors.focus
      : theme.colors.border;

  return (
    <Stack gap="xs" style={containerStyle}>
      {label != null && (
        <AppText
          color={disabled ? 'disabled' : 'secondary'}
          style={{ marginStart: textInset }}
          variant="label">
          {required ? `${label} *` : label}
        </AppText>
      )}

      <Row
        gap="sm"
        testID="app-input-field"
        style={{
          minHeight: theme.sizes.control.medium,
          paddingHorizontal: theme.spacing.md,
          borderWidth: theme.sizes.border.hairline,
          borderColor,
          borderRadius: theme.radius.md,
          backgroundColor: disabled
            ? theme.colors.disabled
            : theme.colors.surface,
        }}>
        {leftElement}

        <View style={{ flex: 1 }}>
          <TextInput
            accessibilityHint={rest.accessibilityHint}
            accessibilityLabel={rest.accessibilityLabel ?? label}
            aria-describedby={description != null ? descriptionId : undefined}
            aria-invalid={hasError}
            aria-required={required}
            editable={isEditable}
            onBlur={event => {
              setIsFocused(false);
              onBlur?.(event);
            }}
            onFocus={event => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            placeholderTextColor={theme.colors.text.disabled}
            style={[
              theme.typography.body,
              {
                color: disabled
                  ? theme.colors.text.disabled
                  : theme.colors.text.primary,
                paddingVertical: theme.spacing.sm,
                // Android draws its own inner padding on TextInput; zeroing it
                // keeps the field the same height on both platforms.
                textAlignVertical: rest.multiline === true ? 'top' : 'center',
              },
            ]}
            {...rest}
          />
        </View>

        {rightElement}
      </Row>

      {description != null && (
        <AppText
          color={hasError ? 'error' : 'secondary'}
          nativeID={descriptionId}
          style={{ marginStart: textInset }}
          variant="caption">
          {description}
        </AppText>
      )}
    </Stack>
  );
};
