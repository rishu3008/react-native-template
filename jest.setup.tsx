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

// Reanimated is mocked rather than loaded.
//
// Its `.native` entry points need a worklet runtime that does not exist under
// Jest, and resolving away from them loads its web build, which requires
// react-native-web. A double covering the handful of APIs this template uses
// is both smaller and more predictable than either.
//
// Animations are therefore not under test. What is under test is that
// animated components render, and their behaviour around the animation.
jest.mock('react-native-reanimated', () => {
  const { View, Text, ScrollView } = require('react-native');

  const passthrough = (value: unknown) => value;
  // gesture-handler reads this off the default export, not the namespace.
  const createAnimatedComponent = (Component: unknown) => Component;

  return {
    __esModule: true,
    default: { View, Text, ScrollView, createAnimatedComponent },
    useSharedValue: (initial: unknown) => ({ value: initial }),
    useAnimatedStyle: (factory: () => object) => factory(),
    useDerivedValue: (factory: () => unknown) => ({ value: factory() }),
    withTiming: passthrough,
    withSpring: passthrough,
    withRepeat: passthrough,
    withDelay: (_delay: number, value: unknown) => value,
    runOnJS: (fn: unknown) => fn,
    runOnUI: (fn: unknown) => fn,
    FadeIn: {},
    FadeOut: {},
    FadeInDown: {},
    FadeOutDown: {},
    Easing: { linear: passthrough, ease: passthrough },
    createAnimatedComponent,
  };
});

// The bottom sheet is driven by gestures and worklets. A minimal double keeps
// screens that mount AppBottomSheet renderable without simulating any of it;
// the adapter's own contract is tested directly instead.
jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = require('react-native');
  const React = require('react');

  // present/dismiss are shared spies so tests can assert the adapter drives
  // the sheet correctly across open/close/reopen cycles.
  const present = jest.fn();
  const dismiss = jest.fn();

  const BottomSheetModal = React.forwardRef(
    (
      props: { children?: React.ReactNode },
      ref: React.Ref<{ present: () => void; dismiss: () => void }>,
    ) => {
      React.useImperativeHandle(ref, () => ({ present, dismiss }));

      return <View>{props.children}</View>;
    },
  );

  return {
    __esModule: true,
    default: View,
    BottomSheetModal,
    BottomSheetModalProvider: ({
      children,
    }: {
      children?: React.ReactNode;
    }) => <View>{children}</View>,
    BottomSheetView: View,
    BottomSheetScrollView: View,
    BottomSheetBackdrop: View,
    // Exposed for assertions; not part of the library's real surface.
    __sheetSpies: { present, dismiss },
  };
});

export {};
