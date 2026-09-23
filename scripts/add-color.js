#!/usr/bin/env node
/**
 * Promote a palette entry to a semantic colour role.
 *
 * The palette is the source of truth. Add the colour and its name there:
 *
 *   // src/theme/tokens/palette.ts
 *   brandAccent: '#123456',
 *
 * then let this script do the wiring:
 *
 *   npm run theme:add-color                     # every unwired entry
 *   npm run theme:add-color -- brandAccent      # just this one
 *   npm run theme:add-color -- brandAccent --dark palette.blue300
 *   npm run theme:add-color -- --check          # report drift, write nothing
 *
 * A role has to be declared in three places that must agree: the ThemeColors
 * type, the light theme and the dark theme. TypeScript catches a missing one,
 * but only after the fact -- this does the wiring so the compiler never has to
 * complain.
 *
 * Both themes point at the same palette entry unless --dark says otherwise,
 * because one hex code cannot describe two themes. A colour that is legible on
 * white rarely is on near-black, so the script reports every role it wired
 * identically: that is a prompt to choose a dark value, not a finished job.
 */
const fs = require('node:fs');
const path = require('node:path');

const PALETTE = path.join('src', 'theme', 'tokens', 'palette.ts');
const TYPES = path.join('src', 'theme', 'types.ts');
const LIGHT = path.join('src', 'theme', 'lightTheme.ts');
const DARK = path.join('src', 'theme', 'darkTheme.ts');

const TYPES_ANCHOR = '\n  transparent: string;\n};';
const THEME_ANCHOR = '\n  transparent: palette.transparent,';

/**
 * A palette key shaped like `neutral500` or `blue300` is a step on a raw
 * colour scale, not a semantic role. Promoting those would defeat rule 9,
 * which exists so components name intent rather than a shade. Naming an entry
 * explicitly overrides this -- an explicit request beats a guess.
 */
const isScaleStep = name => /^[a-z]+\d+$/.test(name);

const fail = message => {
  console.error(`\n  ${message}\n`);
  process.exit(1);
};

const parseArgs = argv => {
  const names = [];
  const flags = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (!token.startsWith('--')) {
      names.push(token);
      continue;
    }

    const key = token.slice(2);

    if (key === 'check') {
      flags.check = true;
      continue;
    }

    // `--role x` is how this script used to name a colour; keep it working.
    if (key === 'role') {
      names.push(argv[i + 1]);
      i += 1;
      continue;
    }

    flags[key] = argv[i + 1];
    i += 1;
  }

  return { names: names.filter(Boolean), flags };
};

/** Every `name: 'value'` pair in the palette object, in file order. */
const readPalette = () => {
  const source = fs.readFileSync(PALETTE, 'utf8');
  const entries = new Map();

  for (const match of source.matchAll(
    /^\s{2}([A-Za-z][A-Za-z0-9]*):\s*'([^']+)'/gm,
  )) {
    entries.set(match[1], match[2]);
  }

  if (entries.size === 0) {
    fail(`No colours found in ${PALETTE}. Has its shape changed?`);
  }

  return entries;
};

/**
 * Top-level roles only. Nested groups such as `text` are indented four
 * spaces, and `text.primary` is not a role that can be wired from here.
 */
const readRoles = () => {
  const source = fs.readFileSync(TYPES, 'utf8');
  const block = source.slice(
    source.indexOf('export type ThemeColors = {'),
    source.indexOf(TYPES_ANCHOR) + TYPES_ANCHOR.length,
  );

  return new Set(
    [...block.matchAll(/^ {2}([A-Za-z][A-Za-z0-9]*):/gm)].map(m => m[1]),
  );
};

/** A palette reference is emitted bare; a literal is quoted. */
const formatValue = value =>
  value.startsWith('palette.') ? value : `'${value}'`;

const validateOverride = (value, flag, palette) => {
  if (value.startsWith('palette.')) {
    const key = value.slice('palette.'.length);

    if (!palette.has(key)) {
      fail(`--${flag} references palette.${key}, which does not exist.`);
    }
    return;
  }

  const isHex = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(
    value,
  );

  if (!isHex && !value.startsWith('rgba(')) {
    fail(
      `--${flag} must be a palette reference, a hex colour or an rgba() string.\n` +
        `  Got "${value}".`,
    );
  }
};

const insertBefore = (file, anchor, line, label) => {
  const content = fs.readFileSync(file, 'utf8');
  const index = content.indexOf(anchor);

  if (index === -1) {
    fail(`Could not find the insertion point in ${label}. Update this script.`);
  }

  fs.writeFileSync(file, content.slice(0, index) + line + content.slice(index));
};

const main = () => {
  const { names, flags } = parseArgs(process.argv.slice(2));
  const palette = readPalette();
  const roles = readRoles();

  if ((flags.light != null || flags.dark != null) && names.length !== 1) {
    fail(
      '--light and --dark apply to a single colour, so name exactly one.\n' +
        `  Got ${names.length === 0 ? 'none' : names.join(', ')}.`,
    );
  }

  let targets;

  if (names.length > 0) {
    for (const name of names) {
      if (!palette.has(name)) {
        fail(
          `"${name}" is not in the palette.\n` +
            `  Add it to ${PALETTE} first:\n\n` +
            `      ${name}: '#RRGGBB',`,
        );
      }

      if (roles.has(name)) {
        fail(`"${name}" is already a role in ThemeColors.`);
      }
    }

    targets = names;
  } else {
    targets = [...palette.keys()].filter(
      name => name !== 'transparent' && !isScaleStep(name) && !roles.has(name),
    );
  }

  if (targets.length === 0) {
    console.log('\n  Every palette colour is already wired. Nothing to do.\n');
    return;
  }

  if (flags.check) {
    console.error(
      `\n  ${targets.length} palette colour(s) are not wired into the theme:\n` +
        targets.map(n => `      ${n}: '${palette.get(n)}'`).join('\n') +
        '\n\n  Run `npm run theme:add-color` to wire them.\n',
    );
    process.exit(1);
  }

  const copied = [];

  for (const name of targets) {
    const light = flags.light ?? `palette.${name}`;
    const dark = flags.dark ?? `palette.${name}`;

    if (flags.light != null) validateOverride(light, 'light', palette);
    if (flags.dark != null) validateOverride(dark, 'dark', palette);

    insertBefore(TYPES, TYPES_ANCHOR, `\n  ${name}: string;`, 'types.ts');
    insertBefore(
      LIGHT,
      THEME_ANCHOR,
      `\n  ${name}: ${formatValue(light)},`,
      'lightTheme.ts',
    );
    insertBefore(
      DARK,
      THEME_ANCHOR,
      `\n  ${name}: ${formatValue(dark)},`,
      'darkTheme.ts',
    );

    console.log(`\n  ${name}  (${palette.get(name)})`);
    console.log(`    types.ts       + ${name}: string;`);
    console.log(`    lightTheme.ts  + ${name}: ${formatValue(light)},`);
    console.log(`    darkTheme.ts   + ${name}: ${formatValue(dark)},`);

    if (light === dark) copied.push(name);
  }

  console.log(
    `\n  Wired ${targets.length} colour(s). Use it as theme.colors.${targets[0]}.`,
  );

  if (copied.length > 0) {
    console.log(
      `\n  Light and dark are the same value for: ${copied.join(', ')}.\n` +
        '  Check it on both themes -- a colour legible on white is often not\n' +
        '  legible on near-black. Edit src/theme/darkTheme.ts, or re-run with\n' +
        `  --dark palette.<step>.`,
    );
  }

  console.log('\n  Then run `npm run typecheck`.\n');
};

main();
