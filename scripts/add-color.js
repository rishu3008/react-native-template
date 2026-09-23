#!/usr/bin/env node
/**
 * Add a semantic colour role to the theme.
 *
 * A role has to be declared in three places that must agree: the ThemeColors
 * type, the light theme and the dark theme. TypeScript catches a missing one,
 * but only after the fact -- this does the wiring so the compiler never has
 * to complain, and so the dark value is a deliberate choice rather than a
 * copy of the light one.
 *
 *   npm run theme:add-color -- --role brandAccent --light '#2563EB' --dark '#60A5FA'
 *   npm run theme:add-color -- --role brandAccent --light palette.blue600 --dark palette.blue400
 *
 * A palette reference is preferred over a literal: rule 9 exists so that
 * re-theming means editing the palette, not hunting hex codes through the
 * themes.
 */
const fs = require('node:fs');
const path = require('node:path');

const TYPES = path.join('src', 'theme', 'types.ts');
const LIGHT = path.join('src', 'theme', 'lightTheme.ts');
const DARK = path.join('src', 'theme', 'darkTheme.ts');

const parseArgs = argv => {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue;
    args[argv[i].slice(2)] = argv[i + 1];
    i += 1;
  }
  return args;
};

const fail = message => {
  console.error(`\n  ${message}\n`);
  process.exit(1);
};

const isHex = value =>
  /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);

/** A palette reference is emitted bare; a literal is quoted. */
const formatValue = value =>
  value.startsWith('palette.') ? value : `'${value}'`;

const validateValue = (value, flag) => {
  if (value == null) fail(`--${flag} is required.`);

  if (value.startsWith('palette.')) {
    const key = value.slice('palette.'.length);
    const palette = fs.readFileSync(
      path.join('src', 'theme', 'tokens', 'palette.ts'),
      'utf8',
    );

    if (!new RegExp(`^\\s*${key}:`, 'm').test(palette)) {
      fail(
        `--${flag} references palette.${key}, which does not exist.\n` +
          '  Add it to src/theme/tokens/palette.ts first.',
      );
    }
    return;
  }

  if (!isHex(value) && !value.startsWith('rgba(')) {
    fail(
      `--${flag} must be a palette reference, a hex colour or an rgba() string.\n` +
        `  Got "${value}".`,
    );
  }
};

const insertBefore = (content, anchor, line, label) => {
  const index = content.indexOf(anchor);
  if (index === -1) fail(`Could not find the insertion point in ${label}.`);
  return content.slice(0, index) + line + content.slice(index);
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));
  const { role } = args;

  if (!role) fail('--role is required. Example: --role brandAccent');

  if (!/^[a-z][A-Za-z0-9]*$/.test(role)) {
    fail(`--role must be a camelCase identifier. Got "${role}".`);
  }

  validateValue(args.light, 'light');
  validateValue(args.dark, 'dark');

  const types = fs.readFileSync(TYPES, 'utf8');

  if (new RegExp(`^\\s*${role}:`, 'm').test(types)) {
    fail(`The role "${role}" already exists in ThemeColors.`);
  }

  // Appended just before the closing brace of ThemeColors, after the last
  // existing role, so the diff is one line rather than a reordering.
  const anchor = '\n  transparent: string;\n};';
  if (!types.includes(anchor)) {
    fail('ThemeColors no longer ends with `transparent`; update this script.');
  }

  fs.writeFileSync(
    TYPES,
    types.replace(anchor, `\n  ${role}: string;\n  transparent: string;\n};`),
  );
  console.log(`  types.ts       + ${role}: string;`);

  for (const [file, value, label] of [
    [LIGHT, args.light, 'lightTheme.ts'],
    [DARK, args.dark, 'darkTheme.ts'],
  ]) {
    const content = fs.readFileSync(file, 'utf8');
    const themeAnchor = '\n  transparent: palette.transparent,';

    fs.writeFileSync(
      file,
      insertBefore(
        content,
        themeAnchor,
        `\n  ${role}: ${formatValue(value)},`,
        label,
      ),
    );
    console.log(`  ${label.padEnd(14)} + ${role}: ${formatValue(value)},`);
  }

  console.log(
    '\n  Added. Run `npm run typecheck` to confirm both themes satisfy ThemeColors.\n',
  );
};

main();
