import { render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AppModal } from '@components';

describe('AppModal', () => {
  it('renders nothing visible when closed', () => {
    render(
      <AppModal onClose={jest.fn()} visible={false}>
        <Text>panel body</Text>
      </AppModal>,
    );

    expect(screen.queryByText('panel body')).not.toBeOnTheScreen();
  });

  it('renders its title and content when open', () => {
    render(
      <AppModal onClose={jest.fn()} title="Confirm" visible>
        <Text>panel body</Text>
      </AppModal>,
    );

    expect(screen.getByText('Confirm')).toBeOnTheScreen();
    expect(screen.getByText('panel body')).toBeOnTheScreen();
  });

  it('closes from the close button', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(
      <AppModal onClose={onClose} title="Confirm" visible>
        <Text>panel body</Text>
      </AppModal>,
    );

    await user.press(screen.getByTestId('app-modal-close'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the scrim is tapped', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(
      <AppModal onClose={onClose} visible>
        <Text>panel body</Text>
      </AppModal>,
    );

    await user.press(
      screen.getByTestId('app-modal-backdrop', { includeHiddenElements: true }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores scrim taps when dismissal is disabled', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(
      <AppModal dismissOnBackdropPress={false} onClose={onClose} visible>
        <Text>panel body</Text>
      </AppModal>,
    );

    await user.press(
      screen.getByTestId('app-modal-backdrop', { includeHiddenElements: true }),
    );

    // Destructive flows must not be dismissable by a stray tap.
    expect(onClose).not.toHaveBeenCalled();
  });
});
