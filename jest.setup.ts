// Jest setup shared by every test file.
//
// @testing-library/react-native registers its own matchers and cleanup from
// v12.4 onward, so only native-module mocks belong here.

// Without this, SafeAreaProvider never yields insets under test and renders no
// children, so every screen assertion runs against an empty tree. The shipped
// mock puts its exports on `default`, so it has to be unwrapped or every named
// import resolves to undefined.
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

export {};
