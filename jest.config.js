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
    // Test helpers, not production code.
    '!src/app/testing/**',
    /**
     * The playground is a visual test surface, not production logic, and it
     * is the first thing a consumer deletes. Its sections are long stretches
     * of JSX whose only assertion worth making -- that they render -- the
     * smoke test already makes by mounting the whole screen.
     *
     * Measuring them would let a large, untestable demo surface drag the
     * threshold down until it stopped protecting the code that matters.
     */
    '!src/features/playground/sections/**',
  ],
  /**
   * Thresholds sit just below what the suite currently achieves, so a
   * rounding change does not fail the build while any real regression does.
   *
   * They ratchet upward and are never lowered to make a build pass (rule 49).
   * If a change cannot meet them, it needs tests.
   */
  coverageThreshold: {
    global: {
      statements: 83,
      branches: 75,
      functions: 76,
      lines: 83,
    },
    // The layers a bug hurts most carry their own higher floor, so overall
    // coverage cannot be propped up by well-tested UI while the API client or
    // the navigation tree quietly rots.
    './src/services/api/': {
      statements: 88,
      branches: 80,
      lines: 88,
    },
    './src/navigation/': {
      statements: 90,
      branches: 80,
      lines: 90,
    },
    './src/components/feedback/': {
      statements: 88,
      branches: 82,
      lines: 88,
    },
  },
};
