/**
 * Lets TypeScript understand `import Logo from '@assets/icons/logo.svg'`.
 * Must stay in step with the svg transformer in metro.config.js.
 */
declare module '*.svg' {
  import type { FC } from 'react';
  import type { SvgProps } from 'react-native-svg';

  const content: FC<SvgProps>;
  export default content;
}
