/**
 * Stands in for SVG files under Jest.
 *
 * metro.config.js runs .svg through react-native-svg-transformer so imports
 * become components. Jest does not use Metro, so without this mapping every
 * `import Icon from './icon.svg'` resolves to undefined and rendering it
 * throws.
 */
import { View, type ViewProps } from 'react-native';

const SvgMock = (props: ViewProps) => <View {...props} />;

export default SvgMock;
