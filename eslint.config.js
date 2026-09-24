const reactNativeConfig = require('@react-native/eslint-config/flat');
const boundariesPlugin = require('eslint-plugin-boundaries');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');

/**
 * @react-native/eslint-config declares support for ESLint 9, but the
 * eslint-plugin-ft-flow it bundles still calls context.getAllComments(),
 * which ESLint 9 removed -- loading any ft-flow rule throws. This template is
 * TypeScript-only (AGENTS.md 41), so Flow linting has nothing to check;
 * dropping the plugin and its rules is the fix rather than a workaround.
 *
 * Revisit when @react-native/eslint-config ships an ESLint 9 compatible
 * ft-flow, or when the template moves to ESLint 10.
 */
const withoutFlowRules = configs =>
  configs.map(config => {
    if (config == null || typeof config !== 'object') {
      return config;
    }

    const next = { ...config };

    if (next.plugins?.['ft-flow'] != null) {
      next.plugins = { ...next.plugins };
      delete next.plugins['ft-flow'];
    }

    if (next.rules != null) {
      next.rules = Object.fromEntries(
        Object.entries(next.rules).filter(
          ([name]) => !name.startsWith('ft-flow/'),
        ),
      );
    }

    return next;
  });

const LAYERS = [
  'app',
  'features',
  'navigation',
  'components',
  'hooks',
  'store',
  'services',
  'theme',
  'utils',
  'constants',
  'types',
  'assets',
];

/**
 * Rule 6 -- dependency direction. Each layer may import only the layers listed
 * against it. Reusable layers never reach upward into business features, so a
 * component importing a feature, or a util importing navigation, fails lint
 * rather than review.
 */
const LAYER_POLICY = {
  app: LAYERS,
  features: LAYERS.filter(layer => layer !== 'app'),
  navigation: LAYERS.filter(layer => layer !== 'app' && layer !== 'navigation'),
  // Components reach neither services nor features: a reusable component that
  // fetches is no longer reusable (rules 6, 63).
  components: [
    'components',
    'theme',
    'hooks',
    'utils',
    'constants',
    'types',
    'assets',
  ],
  hooks: ['hooks', 'services', 'store', 'theme', 'utils', 'constants', 'types'],
  store: ['store', 'services', 'utils', 'constants', 'types'],
  services: ['services', 'utils', 'constants', 'types'],
  theme: ['theme', 'utils', 'constants', 'types', 'assets'],
  // Utils never depend on navigation (rule 6).
  utils: ['utils', 'constants', 'types'],
  constants: ['constants', 'types'],
  types: ['types'],
  assets: ['assets', 'types'],
};

const layerPolicies = Object.entries(LAYER_POLICY).map(([from, allowed]) => ({
  from: { element: { type: from } },
  allow: { to: { element: { types: { anyOf: allowed } } } },
}));

/**
 * Flat ESLint config.
 *
 * The rules below are the mechanical half of AGENTS.md -- see the enforcement
 * table in rule 68. A rule that is only prose decays; anything checkable
 * belongs here rather than in review comments.
 */
module.exports = [
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'ios/**',
      'vendor/**',
      'coverage/**',
      '**/*.d.ts',
    ],
  },

  ...withoutFlowRules(reactNativeConfig),

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { boundaries: boundariesPlugin },
    settings: {
      // Required: without a resolver that understands TypeScript and the @/
      // alias, every import classifies as "unknown" and the boundary rule
      // silently passes.
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.json' },
      },
      'boundaries/elements': LAYERS.map(type => ({
        type,
        pattern: `src/${type}/**`,
      })),
    },
    rules: {
      // Rule 6 -- dependency direction.
      'boundaries/dependencies': [
        'error',
        { default: 'disallow', policies: layerPolicies },
      ],

      // Rule 22 -- centralized logger, no uncontrolled console.
      'no-console': 'error',

      // Rule 9 -- no hardcoded colours outside the theme layer. This, not
      // no-inline-styles, is the rule that enforces token use: a themed
      // design system computes styles from the theme at runtime, so dynamic
      // style objects are correct rather than a smell.
      'react-native/no-color-literals': 'error',
      'react-native/no-inline-styles': 'off',

      // Rule 43 -- large files are a warning sign, not an error.
      'max-lines': [
        'warn',
        { max: 300, skipBlankLines: true, skipComments: true },
      ],

      // Rule 46 -- use the @/ alias instead of deep relative imports.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*'],
              message:
                'Use the @/ alias instead of a deep relative import (AGENTS.md 46).',
            },
          ],
        },
      ],
    },
  },

  // Rule 41 -- strict TypeScript. Scoped to TS files, and the plugin is
  // declared here because flat config resolves plugins per config object.
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { '@typescript-eslint': typescriptPlugin },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // The theme layer is where raw colour values are declared, so the literal
  // ban cannot apply to itself.
  {
    files: ['src/theme/**/*.{ts,tsx}'],
    rules: { 'react-native/no-color-literals': 'off' },
  },

  // Config and tooling files run in Node and are exempt from app rules.
  {
    files: ['*.config.js', '*.setup.ts', 'index.js', 'scripts/**/*.js'],
    rules: {
      'no-console': 'off',
      'max-lines': 'off',
      'boundaries/dependencies': 'off',
    },
  },

  // Tests may reach anywhere and are not size-constrained.
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    rules: {
      'boundaries/dependencies': 'off',
      'max-lines': 'off',
    },
  },
];
