import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { AppIcon } from '@components';
import { sizes } from '@theme';

// Stands in for an SVG imported through the Metro transformer.
const StubIcon = (props: SvgProps) => <View {...props} testID="icon" />;

// A decorative icon is hidden from the accessibility tree, and RNTL excludes
// hidden elements from queries by default -- hence includeHiddenElements here.
const getIcon = () =>
  screen.getByTestId('icon', { includeHiddenElements: true });

describe('AppIcon', () => {
  it('renders at the token size for a named size', () => {
    render(<AppIcon size="large" source={StubIcon} />);

    const icon = getIcon();
    expect(icon.props.width).toBe(sizes.icon.large);
    expect(icon.props.height).toBe(sizes.icon.large);
  });

  it('accepts a raw numeric size', () => {
    render(<AppIcon size={72} source={StubIcon} />);

    expect(getIcon().props.width).toBe(72);
  });

  it('is hidden from assistive technology unless given a label', () => {
    render(<AppIcon source={StubIcon} />);

    // An icon beside a visible label is noise to a screen reader (rule 28).
    const icon = getIcon();
    expect(icon.props.accessible).toBe(false);
    expect(icon.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('joins the accessibility tree when labelled', () => {
    render(<AppIcon accessibilityLabel="Settings" source={StubIcon} />);

    const icon = getIcon();
    expect(icon.props.accessible).toBe(true);
    expect(icon.props.accessibilityLabel).toBe('Settings');
  });
});
