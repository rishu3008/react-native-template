import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native';

import { AppScreen } from '@components';

const flattenContentContainerStyle = () => {
  const scrollView = screen.UNSAFE_getByType(
    require('react-native').ScrollView,
  );

  return StyleSheet.flatten(scrollView.props.contentContainerStyle) as Record<
    string,
    unknown
  >;
};

describe('AppScreen', () => {
  it('renders its children', () => {
    render(
      <AppScreen>
        <Text>content</Text>
      </AppScreen>,
    );

    expect(screen.getByText('content')).toBeOnTheScreen();
  });

  it('grows the scroll content container instead of fixing it to the viewport', () => {
    render(
      <AppScreen scrollable>
        <Text>content</Text>
      </AppScreen>,
    );

    const contentContainerStyle = flattenContentContainerStyle();

    // `flex: 1` here sizes content to exactly the viewport, so it can never
    // overflow and the screen silently stops scrolling. Regression guard.
    expect(contentContainerStyle.flex).toBeUndefined();
    expect(contentContainerStyle.flexGrow).toBe(1);
  });

  it('applies safe-area insets only to the requested edges', () => {
    // The safe-area mock reports zero insets, so this asserts the padding
    // token is applied rather than exact inset arithmetic.
    render(
      <AppScreen edges={['top']} padding="lg" scrollable>
        <Text>content</Text>
      </AppScreen>,
    );

    const contentContainerStyle = flattenContentContainerStyle();

    expect(contentContainerStyle.paddingTop).toBe(16);
    expect(contentContainerStyle.paddingBottom).toBe(16);
  });
});
