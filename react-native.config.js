/**
 * React Native CLI configuration.
 *
 * `assets` is what `npx react-native-asset` reads. This template links fonts
 * with scripts/link-fonts.js instead, which does the same work
 * deterministically and reports what it changed -- but the entry is kept so
 * the standard tool also works for anyone who prefers it.
 */
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/assets/fonts/'],
};
