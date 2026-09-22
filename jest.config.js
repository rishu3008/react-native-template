module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['react-native-gesture-handler/jestSetup'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
  // React Native's preset only whitelists react-native packages for
  // transformation. These ship untransformed ESM, so Jest has to compile them
  // too or it fails on the first `import` statement inside node_modules.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?' +
      '|react-native-gesture-handler|react-native-reanimated' +
      '|react-native-worklets|@gorhom/bottom-sheet' +
      '|react-native-safe-area-context|react-native-svg' +
      '|react-native-screens|@react-navigation' +
      '|react-freeze|nanoid|use-latest-callback)/)',
  ],
  moduleNameMapper: {
    // Jest does not run Metro, so the svg transformer configured in
    // metro.config.js does not apply here. Without this, every .svg import is
    // undefined and rendering it throws.
    '\\.svg$': '<rootDir>/__mocks__/svgMock.tsx',
    // Test half of the path aliases. See babel.config.js.
    '^@app$': '<rootDir>/src/app',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@assets$': '<rootDir>/src/assets',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@components$': '<rootDir>/src/components',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@constants$': '<rootDir>/src/constants',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@features$': '<rootDir>/src/features',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@hooks$': '<rootDir>/src/hooks',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@navigation$': '<rootDir>/src/navigation',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@services$': '<rootDir>/src/services',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@store$': '<rootDir>/src/store',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@theme$': '<rootDir>/src/theme',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@types$': '<rootDir>/src/types',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils$': '<rootDir>/src/utils',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
};
