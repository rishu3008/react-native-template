import { act, render, screen, userEvent } from '@testing-library/react-native';

import { AppButton, ToastProvider, useToast } from '@components';

const Trigger = () => {
  const toast = useToast();

  return (
    <AppButton
      onPress={() => toast.show({ message: 'Saved', duration: 1000 })}
      testID="show"
      title="show"
    />
  );
};

const renderWithProvider = (ui: React.ReactElement) =>
  render(<ToastProvider>{ui}</ToastProvider>);

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows nothing until a toast is raised', () => {
    renderWithProvider(<Trigger />);

    expect(screen.queryByTestId('toast')).not.toBeOnTheScreen();
  });

  it('shows a toast on request', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProvider(<Trigger />);

    await user.press(screen.getByTestId('show'));

    expect(screen.getByText('Saved')).toBeOnTheScreen();
  });

  it('dismisses itself after the duration elapses', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithProvider(<Trigger />);
    await user.press(screen.getByTestId('show'));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('Saved')).not.toBeOnTheScreen();
  });

  it('runs the action and dismisses when the action is pressed', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const ActionTrigger = () => {
      const toast = useToast();
      return (
        <AppButton
          onPress={() =>
            toast.show({ message: 'Failed', actionLabel: 'Retry', onAction })
          }
          testID="show"
          title="show"
        />
      );
    };

    renderWithProvider(<ActionTrigger />);
    await user.press(screen.getByTestId('show'));
    await user.press(screen.getByTestId('toast-action'));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Failed')).not.toBeOnTheScreen();
  });
});
