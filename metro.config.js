const path = require('node:path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    // Turns `import Logo from '@assets/icons/logo.svg'` into a React
    // component. Paired with the *.svg module declaration in src/types.
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    // SVG moves from the asset pipeline to the source pipeline so the
    // transformer above sees it.
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
    // Metro resolves aliases through the Babel plugin, but declaring them
    // here too keeps resolution working for the paths Babel does not
    // transform (asset requires, haste lookups).
    extraNodeModules: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
