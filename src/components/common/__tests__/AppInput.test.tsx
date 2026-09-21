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
  it('insets label and description to the same left edge as the input text', () => {
    render(
      <AppInput error="Enter a valid email" label="Email" value="aaaaa" />,
    );

    const flat = (node: ReactTestInstance) =>
      StyleSheet.flatten(node.props.style) as Record<string, number>;

    // Where the input text actually starts: the field's border plus its
    // inner padding.
    const field = flat(screen.getByTestId('app-input-field'));
    const inputTextEdge =
      (field.paddingHorizontal ?? 0) + (field.borderWidth ?? 0);

    // Guards against the assertion passing vacuously if the field ever loses
    // its padding and everything collapses to zero.
    expect(inputTextEdge).toBeGreaterThan(0);

    // Derived, not hardcoded: if the field's padding changes, this still
    // asserts that all three elements moved together.
    expect(flat(screen.getByText('Email')).marginStart).toBe(inputTextEdge);
    expect(flat(screen.getByText('Enter a valid email')).marginStart).toBe(
      inputTextEdge,
    );
  });
});
