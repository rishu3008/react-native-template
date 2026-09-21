# TemplateProject

A production-grade, reusable React Native starter template.

It provides roughly **90% of the engineering foundation and none of the business
logic**. A new application should mostly add `src/features/`, not rebuild the
theme, navigation, API client, storage, auth architecture, error handling,
logging, testing or CI.

The engineering rules this template is built under live in
[AGENTS.md](./AGENTS.md). Read that before contributing.

---

## Baseline

|              |                                                                              |
| ------------ | ---------------------------------------------------------------------------- |
| React Native | 0.87.1                                                                       |
| React        | 19.2.3                                                                       |
| TypeScript   | 6.x, strict                                                                  |
| Architecture | New Architecture (Fabric + TurboModules)                                     |
| JS engine    | Hermes                                                                       |
| Node         | 22.11.0 (see `.nvmrc`)                                                       |
| Android      | compileSdk 37, targetSdk 36, minSdk 24, Kotlin 2.2.0, Gradle 9.4.1, NDK 27.1 |
| Java         | 17                                                                           |
| iOS          | UIScene life cycle, CocoaPods                                                |

The canonical placeholder identity is `TemplateProject` / `com.templateproject`.
See AGENTS.md rule 56.1 for why the placeholder is not simply `Template`.

---

## Getting started

```bash
nvm use            # Node 22.11.0
npm install
bundle install     # Ruby gems for CocoaPods
bundle exec pod install --project-directory=ios

npm start          # Metro
npm run android
npm run ios
```

---

## Scripts

| Script                                      | Purpose                                           |
| ------------------------------------------- | ------------------------------------------------- |
| `npm run android` / `npm run ios`           | Run the app on a device or simulator              |
| `npm start`                                 | Start Metro                                       |
| `npm run typecheck`                         | `tsc --noEmit`                                    |
| `npm run lint` / `lint:fix`                 | ESLint                                            |
| `npm run format` / `format:check`           | Prettier                                          |
| `npm test` / `test:watch` / `test:coverage` | Jest                                              |
| `npm run validate`                          | typecheck + lint + test — run this before pushing |

Pre-commit runs `lint-staged` only, so hooks stay fast; `validate` and the
native builds belong to CI (AGENTS.md rules 40, 54).

---

## Source structure

```text
src/
├── app/            # entry, bootstrap, providers, config
├── components/     # primitives, common, feedback, forms
├── features/       # business features (screens live here, not globally)
├── navigation/     # navigators and linking
├── theme/          # tokens, light/dark themes
├── services/       # api, auth, storage, permissions, analytics, logging
├── hooks/
├── store/
├── assets/
├── constants/
├── types/
└── utils/
```

Business features live under `src/features/`. There is deliberately no global
`screens/` directory — that does not scale for a large application.

---

## Path aliases

```ts
import { AppButton } from '@components'; // through the barrel
import { AppButton } from '@components/common/AppButton'; // or directly
```

| Alias         | Path             |     | Alias         | Path             |
| ------------- | ---------------- | --- | ------------- | ---------------- |
| `@app`        | `src/app`        |     | `@services`   | `src/services`   |
| `@assets`     | `src/assets`     |     | `@store`      | `src/store`      |
| `@components` | `src/components` |     | `@theme`      | `src/theme`      |
| `@constants`  | `src/constants`  |     | `@types`      | `src/types`      |
| `@features`   | `src/features`   |     | `@utils`      | `src/utils`      |
| `@hooks`      | `src/hooks`      |     | `@navigation` | `src/navigation` |

Aliases are declared in **three places that must agree** — `tsconfig.json`
(`paths`), `babel.config.js` (`module-resolver`) and `jest.config.js`
(`moduleNameMapper`). Configuring only the TypeScript half produces code that
typechecks and then fails to resolve at runtime. Add a new alias to all three.

---

## Architecture enforcement

Dependency direction (AGENTS.md rule 6) is enforced by ESLint, not by review:

```text
features → navigation → components → theme → utils → constants → types
```

Reusable layers never reach upward into business features. A component that
imports a feature, or a util that imports navigation, fails `npm run lint`.
The policy is the `LAYER_POLICY` map in `eslint.config.js`.

---

## Dependencies

Every native dependency is exact-pinned (AGENTS.md 3.1) and sits behind an
adapter (rule 48), so application code never imports the vendor directly.

| Package                                     | Used by          | Why this one                                                                                                                                                                          |
| ------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-native-safe-area-context`            | `AppScreen`      | Standard safe-area source                                                                                                                                                             |
| `@react-native-async-storage/async-storage` | `storageService` | Mature, one native module. MMKV was considered and rejected: synchronous reads are nice, but it pulls in `react-native-nitro-modules` for a benefit the hydration gate already solves |
| `react-native-svg` (+ transformer)          | `AppIcon`        | Icons as scalable components rather than per-density rasters                                                                                                                          |
| `@d11/react-native-fast-image`              | `AppImage`       | Disk/memory caching. The original `react-native-fast-image` was last published in 2022 and has no New Architecture support, so the maintained fork is used                            |

## Known issues

- **ESLint is pinned to 9.39.5.** `@react-native/eslint-config@0.87.1` peers on
  `^8 || ^9`, so ESLint 10 is out of range. Revisit when it supports 10.
- **`eslint-plugin-ft-flow` is stripped** from the React Native ESLint config.
  It calls `context.getAllComments()`, removed in ESLint 9, and throws on load.
  This template is TypeScript-only, so Flow linting has nothing to check.
- **`@d11/react-native-fast-image` types reference `FlexStyle`**, which React
  Native 0.87 no longer exports. `skipLibCheck` hides the unresolved reference,
  leaving its `ImageStyle` with no layout properties at all. `AppImage` exposes
  React Native's `ImageStyle` and casts once at the vendor boundary.
- **Reanimated cannot be loaded under Jest.** Its `.native` entry points need
  a worklet runtime that does not exist there, and resolving away from them
  loads its web build, which requires `react-native-web`. It is mocked in
  `jest.setup.tsx` instead, so animations themselves are not under test --
  only that animated components render and behave correctly around them.
- **React Native 0.87.1 does not adopt the UIScene life cycle.** Every stock
  0.87.1 app fails to launch on iOS 26. This template adopts it in
  `ios/TemplateProject/SceneDelegate.swift`; the fix is worth carrying forward
  through RN upgrades until React Native ships its own scene support.

---

## Design system

Themes are `light` and `dark`, with a `system` preference that follows device
appearance. The choice is persisted, and nothing renders until it has been read
back, so a cold start never flashes the wrong theme.

Components read tokens through `useTheme()`. Never call `useColorScheme()` in a
component -- dark-mode detection happens once, in the provider.

```tsx
const { theme, mode, preference, setPreference } = useTheme();
```

Sizing uses fixed dp tokens rather than screen-scaled values. dp is already
density-independent, and linearly scaling every value turns a tablet layout
into a magnified phone layout. `useBreakpoint()` changes _layout_ at width
thresholds; it does not grow the type scale.

`react-native/no-color-literals` is an error outside `src/theme`, which is what
actually enforces token use. `no-inline-styles` is off: a themed system
computes styles from the theme at runtime, so dynamic style objects are correct
rather than a smell.

## Overlays and feedback

`AppModal` wraps React Native's own Modal, which already handles the Android
hardware back button and native focus containment. `AppBottomSheet` adapts
`@gorhom/bottom-sheet`, using its portal-rendered modal variant so sheets
cannot be clipped by layout; it needs `BottomSheetModalProvider`, which lives
in the app providers.

Toasts are imperative, because they are raised from event handlers and
services rather than rendered inline:

```tsx
const toast = useToast();
toast.show({ message: 'Saved', tone: 'success' });
```

One toast shows at a time. Stacking buries the newest message and competes
with whatever the user is doing.

`OfflineBanner` takes a `visible` prop rather than subscribing to connectivity
itself: network detection is a service concern, and rule 63 forbids a reusable
component quietly owning a subscription. The hook that drives it arrives with
the networking layer.

## Version coupling

`react-native-reanimated` and `react-native-worklets` are a matched pair --
worklets is reanimated's runtime, and reanimated declares an exact minor peer
on it. Upgrade both together:

| reanimated | worklets |
| ---------- | -------- |
| 4.6.x      | 0.12.x   |
| 4.7.x      | 0.13.x   |

## Status

Phases 1 (foundation), 2 (design system) and 3 (overlays and feedback) are
complete. Navigation, the data layer and template packaging follow.

The 16 KB page-size check required by rule 34 was run against the debug APK
after the animation stack landed: all 20 arm64 libraries, including
`libreanimated.so`, `libworklets.so` and `libgesturehandler.so`, have every
PT_LOAD segment aligned to at least 16384. See AGENTS.md rule 69 for how the template
is distributed and rule 57 for the release process.
