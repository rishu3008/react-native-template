import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AppImage } from '@components';

const source = { uri: 'https://example.com/photo.jpg' };

describe('AppImage', () => {
  it('renders the image', () => {
    render(
      <AppImage
        accessibilityLabel="Profile photo"
        source={source}
        testID="image"
      />,
    );

    expect(screen.getByTestId('image')).toBeOnTheScreen();
  });

  it('swaps in the fallback when the image fails to load', () => {
    render(
      <AppImage
        fallback={<Text>could not load</Text>}
        source={source}
        testID="image"
      />,
    );

    fireEvent(screen.getByTestId('image'), 'error', {
      nativeEvent: { error: '404' },
    });

    // A broken remote image must not leave an invisible empty box (rule 21).
    expect(screen.getByText('could not load')).toBeOnTheScreen();
    expect(screen.queryByTestId('image')).not.toBeOnTheScreen();
  });

  it('keeps rendering the image when it fails and no fallback is given', () => {
    render(<AppImage source={source} testID="image" />);

    fireEvent(screen.getByTestId('image'), 'error', {
      nativeEvent: { error: '404' },
    });

    expect(screen.getByTestId('image')).toBeOnTheScreen();
  });

  it('forwards the caller onError alongside its own handling', () => {
    const onError = jest.fn();
    render(<AppImage onError={onError} source={source} testID="image" />);

    fireEvent(screen.getByTestId('image'), 'error', {
      nativeEvent: { error: '404' },
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });
});
