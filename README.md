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

## Known issues

- **ESLint is pinned to 9.39.5.** `@react-native/eslint-config@0.87.1` peers on
  `^8 || ^9`, so ESLint 10 is out of range. Revisit when it supports 10.
- **`eslint-plugin-ft-flow` is stripped** from the React Native ESLint config.
  It calls `context.getAllComments()`, removed in ESLint 9, and throws on load.
  This template is TypeScript-only, so Flow linting has nothing to check.
- **React Native 0.87.1 does not adopt the UIScene life cycle.** Every stock
  0.87.1 app fails to launch on iOS 26. This template adopts it in
  `ios/TemplateProject/SceneDelegate.swift`; the fix is worth carrying forward
  through RN upgrades until React Native ships its own scene support.

---

## Status

Phase 1 (foundation) is complete. Theme, component library, navigation, data
layer and template packaging follow. See AGENTS.md rule 69 for how the template
is distributed and rule 57 for the release process.
