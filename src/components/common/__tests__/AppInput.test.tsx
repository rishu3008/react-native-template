import { render, screen } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import { StyleSheet } from 'react-native';

import { AppInput } from '@components';

describe('AppInput', () => {
  it('labels the field from its visible label', () => {
    render(<AppInput label="Email" value="" />);

    expect(screen.getByLabelText('Email')).toBeOnTheScreen();
  });

  it('shows helper text when there is no error', () => {
    render(
      <AppInput helperText="We never share this." label="Email" value="" />,
    );

    expect(screen.getByText('We never share this.')).toBeOnTheScreen();
  });

  it('replaces helper text with the error and marks the field invalid', () => {
    render(
      <AppInput
        error="Enter a valid email"
        helperText="We never share this."
        label="Email"
        value="nope"
      />,
    );

    expect(screen.getByText('Enter a valid email')).toBeOnTheScreen();
    expect(screen.queryByText('We never share this.')).not.toBeOnTheScreen();
    // Announced as invalid, not merely coloured red (AGENTS.md 28).
    expect(screen.getByLabelText('Email').props['aria-invalid']).toBe(true);
  });

  it('is not editable when disabled', () => {
    render(<AppInput disabled label="Email" value="" />);

    expect(screen.getByLabelText('Email').props.editable).toBe(false);
  });
});

describe('AppInput alignment', () => {
  it('keeps label and description flush with the field, not with the input text', () => {
    render(
      <AppInput error="Enter a valid email" label="Email" value="aaaaa" />,
    );

    const flat = (node: ReactTestInstance) =>
      StyleSheet.flatten(node.props.style) as Record<
        string,
        number | undefined
      >;

    // Label and description sit outside the border, so they share the
    // screen's content edge with the field and the surrounding headings.
    // Insetting them to match the input text detaches the whole column from
    // everything else on the screen.
    expect(flat(screen.getByText('Email')).marginStart).toBeUndefined();
    expect(
      flat(screen.getByText('Enter a valid email')).marginStart,
    ).toBeUndefined();

    // The text inside the border is inset by the field's own padding.
    const field = flat(screen.getByTestId('app-input-field'));
    expect(field.paddingHorizontal).toBeGreaterThan(0);
  });
});
