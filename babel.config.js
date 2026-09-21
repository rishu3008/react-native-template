module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Runtime half of the path aliases. Must stay in step with `paths` in
    // tsconfig.json and `moduleNameMapper` in jest.config.js -- configuring
    // only the TypeScript half produces code that typechecks and then fails
    // to resolve at runtime (AGENTS.md 46).
    //
    // Each alias points at a directory rather than at its index.ts, so both
    // `@components` (through the barrel) and `@components/common/AppButton`
    // (bypassing it) resolve. Aliasing straight to index.ts breaks the latter.
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@app': './src/app',
          '@assets': './src/assets',
          '@components': './src/components',
          '@constants': './src/constants',
          '@features': './src/features',
          '@hooks': './src/hooks',
          '@navigation': './src/navigation',
          '@services': './src/services',
          '@store': './src/store',
          '@theme': './src/theme',
          '@types': './src/types',
          '@utils': './src/utils',
        },
      },
    ],
  ],
};
