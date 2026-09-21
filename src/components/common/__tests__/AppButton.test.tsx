import { render, screen, userEvent } from '@testing-library/react-native';

import { AppButton } from '@components';

describe('AppButton', () => {
  it('calls onPress when enabled', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    render(<AppButton onPress={onPress} title="Continue" />);

    await user.press(screen.getByRole('button', { name: 'Continue' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    render(<AppButton disabled onPress={onPress} title="Continue" />);

    await user.press(screen.getByRole('button', { name: 'Continue' }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('blocks presses while loading and reports itself as busy', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    render(<AppButton loading onPress={onPress} title="Continue" />);

    const button = screen.getByRole('button', { name: 'Continue' });
    await user.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeBusy();
    expect(button).toBeDisabled();
    // The label is swapped for a spinner rather than the button unmounting,
    // so the layout does not jump while a request is in flight.
    expect(screen.getByTestId('app-button-spinner')).toBeOnTheScreen();
    expect(screen.queryByText('Continue')).not.toBeOnTheScreen();
  });

  it('prefers an explicit accessibility label over the visible title', () => {
    render(
      <AppButton
        accessibilityLabel="Continue to payment"
        onPress={jest.fn()}
        title="Continue"
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Continue to payment' }),
    ).toBeOnTheScreen();
  });
});
