import { render, screen, userEvent } from '@testing-library/react-native';

import {
  EmptyState,
  ErrorState,
  Loader,
  OfflineBanner,
  Skeleton,
  SuccessState,
} from '@components';

describe('EmptyState', () => {
  it('uses default copy and runs its action', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();
    render(<EmptyState actionLabel="Add one" onAction={onAction} />);

    expect(screen.getByText('Nothing here yet')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Add one' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('shows no action when none is supplied', () => {
    render(<EmptyState />);

    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });
});

describe('ErrorState', () => {
  it('offers retry when a handler is given', async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();
    render(<ErrorState onRetry={onRetry} />);

    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('omits the retry button when no handler is given', () => {
    render(<ErrorState />);

    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });
});

describe('SuccessState', () => {
  it('renders default copy', () => {
    render(<SuccessState />);

    expect(screen.getByText('All done')).toBeOnTheScreen();
  });
});

describe('Loader', () => {
  it('announces itself as a progress indicator', () => {
    render(<Loader label="Loading orders" />);

    // A bare spinner is silent to assistive technology (rule 28).
    expect(
      screen.getByRole('progressbar', { name: 'Loading orders' }),
    ).toBeOnTheScreen();
  });

  it('falls back to a generic label', () => {
    render(<Loader />);

    expect(
      screen.getByRole('progressbar', { name: 'Loading' }),
    ).toBeOnTheScreen();
  });
});

describe('OfflineBanner', () => {
  it('renders nothing when online', () => {
    render(<OfflineBanner testID="banner" visible={false} />);

    expect(screen.queryByTestId('banner')).not.toBeOnTheScreen();
  });

  it('announces politely when offline', () => {
    render(<OfflineBanner testID="banner" visible />);

    const banner = screen.getByTestId('banner');
    expect(screen.getByText('No internet connection')).toBeOnTheScreen();
    expect(banner.props.accessibilityLiveRegion).toBe('polite');
  });
});

describe('Skeleton', () => {
  it('is hidden from assistive technology', () => {
    render(<Skeleton testID="skeleton" />);

    // The surrounding container announces loading; placeholder boxes are
    // noise in the accessibility tree (rule 28).
    const skeleton = screen.getByTestId('skeleton', {
      includeHiddenElements: true,
    });
    expect(skeleton.props.importantForAccessibility).toBe(
      'no-hide-descendants',
    );
  });
});
