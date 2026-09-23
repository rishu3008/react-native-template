# Upgrading

React Native is never upgraded automatically (AGENTS.md 3). A template
release is a product release, and an RN bump changes native build files that
no test covers.

## Process

Every upgrade happens on its own branch (rule 58).

1. **Read the release notes and the migration guide.** Not the changelog
   summary -- the migration section, which is where the native changes are.
2. **Diff the native files** with the React Native Upgrade Helper for the
   exact version pair. Apply changes by hand; do not take the diff wholesale,
   because this template has deliberately diverged from the stock project.
3. **Check every native dependency** against the new version before starting.
   One incompatible module blocks the whole upgrade, and finding that out
   after rewriting the native files wastes the rewrite.
4. **Update the dependency pins.** Native packages are exact-pinned (rule 3.1)
   so this is a deliberate edit, not a range resolving itself.
5. **Run the gate**: `npm run validate`, then both platform builds.
6. **Verify the 16 KB page-size check** (`node scripts/check-16kb-alignment.js`).
   A new native dependency version can regress alignment, and that failure
   only appears on Android 15 devices.
7. **Run on real devices**, both platforms. The simulator does not exercise
   the paths that break most often on an upgrade.
8. **Test template generation**: rename into a scratch project and build it
   (rule 55).
9. **Release** with a new template version. Never overwrite an existing one.

## Divergences from the stock React Native project

These are deliberate, and an upgrade must preserve them rather than reverting
to what the Upgrade Helper produces.

| File                                          | Divergence                                      | Why                                                                                                           |
| --------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `ios/TemplateProject/SceneDelegate.swift`     | Exists at all                                   | React Native 0.87 ships no UIScene adoption, and iOS 26 refuses to launch without it                          |
| `ios/TemplateProject/AppDelegate.swift`       | No window creation                              | The window comes from the connecting scene                                                                    |
| `ios/Podfile`                                 | Configuration map in `project`                  | CocoaPods defaults unknown configuration names to `:release`, which compiles out the dev server               |
| `ios/Podfile`                                 | Deployment target floor in `post_install`       | Some pods, and the resource bundles CocoaPods generates for them, declare targets below the supported minimum |
| `ios/Podfile`                                 | `setup_permissions`                             | Rewrites `RNPermissions.podspec`; a permission missing here returns `unavailable` at runtime                  |
| `babel.config.js`                             | `@babel/plugin-transform-export-namespace-from` | Zod 4 ships syntax React Native's preset does not transform                                                   |
| `babel.config.js`                             | Worklets plugin last                            | It rewrites worklet functions; anything after it is not processed                                             |
| `android/app/build.gradle`                    | Product flavours                                | Per-environment identity, so variants install side by side                                                    |
| `android/app/src/main/res/values/strings.xml` | No `app_name`                                   | Supplied per flavour by `resValue`; declaring both is a duplicate-resource error                              |

## Version coupling

`react-native-reanimated` and `react-native-worklets` are a matched pair --
worklets is reanimated's runtime and reanimated pins an exact minor peer on
it. Upgrade both together.

`@react-native/eslint-config` bounds the usable ESLint major. It currently
peers on `^8 || ^9`, which is why ESLint is pinned to 9.x.

## After upgrading

Update `template.config.json` and the baseline table in the README, then tag
a new template version (rule 57).
