import { render, screen } from '@testing-library/react-native';

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
