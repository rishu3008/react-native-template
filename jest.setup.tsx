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

// AsyncStorage is a TurboModule with no JS fallback; an in-memory double keeps
// storage-backed behaviour (the persisted theme preference) testable.
jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};

  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) => Promise.resolve(store[key] ?? null)),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store = {};
        return Promise.resolve();
      }),
    },
  };
});

// FastImage ships no jest mock of its own. Rendering a plain View keeps
// components that embed images (Avatar, cards) renderable under test.
jest.mock('@d11/react-native-fast-image', () => {
  const { View } = require('react-native');

  const FastImage = (props: Record<string, unknown>) => <View {...props} />;
  FastImage.resizeMode = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  };
  FastImage.priority = { low: 'low', normal: 'normal', high: 'high' };
  FastImage.cacheControl = {
    immutable: 'immutable',
    web: 'web',
    cacheOnly: 'cacheOnly',
  };

  return { __esModule: true, default: FastImage };
});

export {};
