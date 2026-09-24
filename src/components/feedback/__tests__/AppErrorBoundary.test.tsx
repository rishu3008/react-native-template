import { render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AppErrorBoundary } from '@components';

const Boom = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('render exploded');
  }

  return <Text>healthy</Text>;
};

describe('AppErrorBoundary', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    // React logs caught errors to console.error; silencing keeps the test
    // output readable without hiding failures.
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders children when nothing throws', () => {
    render(
      <AppErrorBoundary>
        <Boom shouldThrow={false} />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('healthy')).toBeOnTheScreen();
  });

  it('shows a fallback instead of blanking the app', () => {
    render(
      <AppErrorBoundary>
        <Boom shouldThrow />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
  });

  it('reports the error through the injected callback', () => {
    const onError = jest.fn();

    render(
      <AppErrorBoundary onError={onError}>
        <Boom shouldThrow />
      </AppErrorBoundary>,
    );

    // Injected rather than imported, so the component stays free of services
    // (rules 6, 63).
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'render exploded' }),
      expect.anything(),
    );
  });

  it('supports a custom fallback', () => {
    render(
      <AppErrorBoundary fallback={() => <Text>custom fallback</Text>}>
        <Boom shouldThrow />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('custom fallback')).toBeOnTheScreen();
  });

  it('recovers when retry is pressed', async () => {
    const user = userEvent.setup();

    const Wrapper = ({ shouldThrow }: { shouldThrow: boolean }) => (
      <AppErrorBoundary>
        <Boom shouldThrow={shouldThrow} />
      </AppErrorBoundary>
    );

    const { rerender } = render(<Wrapper shouldThrow />);
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();

    rerender(<Wrapper shouldThrow={false} />);
    await user.press(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByText('healthy')).toBeOnTheScreen();
  });

  it('resets when resetKey changes', () => {
    const Wrapper = ({
      shouldThrow,
      routeKey,
    }: {
      shouldThrow: boolean;
      routeKey: string;
    }) => (
      <AppErrorBoundary resetKey={routeKey}>
        <Boom shouldThrow={shouldThrow} />
      </AppErrorBoundary>
    );

    const { rerender } = render(<Wrapper routeKey="a" shouldThrow />);
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();

    // Without this, a boundary that has caught stays broken forever: the
    // user navigates away and the subtree never recovers.
    rerender(<Wrapper routeKey="b" shouldThrow={false} />);

    expect(screen.getByText('healthy')).toBeOnTheScreen();
  });
});
