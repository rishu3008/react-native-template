#!/usr/bin/env node
/**
 * Rename the template into a real project (AGENTS.md 41, 55, 56).
 *
 * Renaming is not search-and-replace. A project's identity spans the display
 * name, the Android namespace and applicationId, the iOS bundle identifier,
 * the Kotlin package *directory*, the Xcode project, workspace and scheme
 * *filenames*, and the deep-link URL scheme. Missing any one of them produces
 * a project that builds and then misbehaves somewhere far from the rename.
 *
 * Usage:
 *   node scripts/rename.js --name MyApp --bundle-id com.acme.myapp
 *   node scripts/rename.js --name MyApp --bundle-id com.acme.myapp --dry-run
 *
 * Options:
 *   --name          PascalCase project name. Becomes the Xcode target,
 *                   scheme, Gradle root project and default display name.
 *   --bundle-id     Reverse-DNS identifier used for both the Android
 *                   applicationId/namespace and the iOS bundle identifier.
 *   --display-name  Home-screen name. Defaults to --name.
 *   --scheme        URL scheme for deep links. Defaults to the lowercased
 *                   --name.
 *   --dry-run       Report what would change without writing anything.
 *   --keep-script   Keep this script after renaming. It is removed by
 *                   default, because it is the last file carrying the
 *                   placeholder identity.
 */
const fs = require('node:fs');
const path = require('node:path');

const PLACEHOLDER = {
  name: 'TemplateProject',
  bundleId: 'com.templateproject',
  scheme: 'templateproject',
  /** Namespace used for storage keys and keychain service names. */
  storageNamespace: '@template',
};

/**
 * Paths never rewritten.
 *
 * node_modules and Pods are regenerated. The lockfile is touched only for its
 * own name field -- a blanket replacement there would corrupt unrelated
 * package names. The docs describe the template itself and keep their
 * references.
 */
const EXCLUDED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  'Pods',
  'build',
  'DerivedData',
  '.gradle',
  'vendor',
  'coverage',
  'scripts',
]);

const EXCLUDED_FILES = new Set([
  'package-lock.json',
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'yarn.lock',
]);

const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.gradle',
  '.kt',
  '.java',
  '.swift',
  '.h',
  '.m',
  '.mm',
  '.plist',
  '.xml',
  '.pbxproj',
  '.xcscheme',
  '.xcworkspacedata',
  '.storyboard',
  '.rb',
  '.yml',
  '.yaml',
  '.properties',
  '.podspec',
  '.xcconfig',
  '.env',
  '.development',
  '.staging',
  '.production',
  // Documentation belonging to the generated project. README, AGENTS and
  // CLAUDE are excluded by name below: those describe the template itself.
  '.md',
]);

const parseArgs = argv => {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const key = token.slice(2);
    if (key === 'dry-run') {
      args.dryRun = true;
    } else {
      args[key] = argv[i + 1];
      i += 1;
    }
  }

  return args;
};

const fail = message => {
  console.error(`\n  ${message}\n`);
  process.exit(1);
};

const validate = args => {
  if (!args.name) fail('--name is required.');
  if (!args['bundle-id']) fail('--bundle-id is required.');

  // Must be a valid Java/Kotlin identifier and an Xcode target name.
  if (!/^[A-Z][A-Za-z0-9]*$/.test(args.name)) {
    fail(
      `--name must be PascalCase letters and digits only. Got "${args.name}".\n` +
        '  It becomes a Swift module name and a Gradle project name, neither of\n' +
        '  which tolerates spaces, hyphens or a leading digit.',
    );
  }

  // Two segments minimum; every segment a valid package identifier. Android
  // rejects a single-segment applicationId outright.
  const segments = args['bundle-id'].split('.');
  if (
    segments.length < 2 ||
    !segments.every(s => /^[a-z][a-z0-9_]*$/.test(s))
  ) {
    fail(
      `--bundle-id must be lowercase reverse-DNS with at least two segments.\n` +
        `  Got "${args['bundle-id']}". Example: com.acme.myapp`,
    );
  }

  const scheme = args.scheme ?? args.name.toLowerCase();
  if (!/^[a-z][a-z0-9+.-]*$/.test(scheme)) {
    fail(
      `--scheme must start with a letter and be URL-scheme safe. Got "${scheme}".`,
    );
  }
};

const walk = (dir, visit) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRECTORIES.has(entry.name)) continue;
      walk(path.join(dir, entry.name), visit);
    } else if (!EXCLUDED_FILES.has(entry.name)) {
      visit(path.join(dir, entry.name));
    }
  }
};

/**
 * Extensionless files that still carry identity.
 *
 * The Podfile names the Xcode target and declares the project path, and has
 * no extension -- so an extension-only check silently skips it and leaves a
 * project that cannot install pods.
 */
const TEXT_FILENAMES = new Set(['Podfile', 'LICENSE']);

const isTextFile = file => {
  const base = path.basename(file);
  return (
    TEXT_EXTENSIONS.has(path.extname(file)) ||
    TEXT_FILENAMES.has(base) ||
    base.startsWith('.env')
  );
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));
  validate(args);

  const target = {
    name: args.name,
    bundleId: args['bundle-id'],
    displayName: args['display-name'] ?? args.name,
    scheme: args.scheme ?? args.name.toLowerCase(),
    storageNamespace: `@${args.name.toLowerCase()}`,
  };

  const { dryRun } = args;
  const root = process.cwd();

  console.log(`\n  ${dryRun ? 'Dry run:' : 'Renaming:'}\n`);
  console.log(`    name          ${PLACEHOLDER.name} -> ${target.name}`);
  console.log(
    `    bundle id     ${PLACEHOLDER.bundleId} -> ${target.bundleId}`,
  );
  console.log(`    display name  ${target.displayName}`);
  console.log(`    url scheme    ${PLACEHOLDER.scheme} -> ${target.scheme}\n`);

  /**
   * Ordered longest-first. `com.templateproject` has to be replaced before
   * the bare `templateproject`, or the bare pattern eats its prefix and
   * leaves `com.` stranded in front of the new scheme.
   */
  const replacements = [
    [PLACEHOLDER.bundleId, target.bundleId],
    [PLACEHOLDER.name, target.name],
    [PLACEHOLDER.storageNamespace, target.storageNamespace],
    [PLACEHOLDER.scheme, target.scheme],
  ];

  let filesChanged = 0;

  walk(root, file => {
    if (!isTextFile(file)) return;

    const original = fs.readFileSync(file, 'utf8');
    let updated = original;

    for (const [from, to] of replacements) {
      updated = updated.split(from).join(to);
    }

    if (updated === original) return;

    filesChanged += 1;
    console.log(`    edit   ${path.relative(root, file)}`);
    if (!dryRun) fs.writeFileSync(file, updated);
  });

  /**
   * Directory and file moves.
   *
   * Done after the content pass: the Kotlin `package` statement and the
   * Xcode project references are rewritten first, so a failure here leaves
   * files whose contents are already consistent with their new home.
   */
  const androidPackageDir = path.join(
    'android',
    'app',
    'src',
    'main',
    'java',
    ...PLACEHOLDER.bundleId.split('.'),
  );
  const androidTargetDir = path.join(
    'android',
    'app',
    'src',
    'main',
    'java',
    ...target.bundleId.split('.'),
  );

  const moves = [
    [androidPackageDir, androidTargetDir],
    [`ios/${PLACEHOLDER.name}`, `ios/${target.name}`],
    [`ios/${PLACEHOLDER.name}.xcodeproj`, `ios/${target.name}.xcodeproj`],
    [`ios/${PLACEHOLDER.name}.xcworkspace`, `ios/${target.name}.xcworkspace`],
  ];

  // The scheme lives inside the project directory that was just moved, so it
  // is resolved against whichever of the two currently exists. Without this
  // a dry run reports no scheme move at all, and the check would be silently
  // skipped rather than verified.
  const schemeParent = fs.existsSync(
    path.join(root, `ios/${target.name}.xcodeproj`),
  )
    ? `ios/${target.name}.xcodeproj`
    : `ios/${PLACEHOLDER.name}.xcodeproj`;

  // Every scheme, not just the default one: the template ships a second
  // scheme for the staging configurations, and a project that adds more must
  // not have them silently left behind under the old name.
  const schemeDir = `${schemeParent}/xcshareddata/xcschemes`;
  const schemeDirFull = path.join(root, schemeDir);

  if (fs.existsSync(schemeDirFull)) {
    for (const scheme of fs.readdirSync(schemeDirFull)) {
      if (!scheme.startsWith(PLACEHOLDER.name)) continue;

      const renamed = target.name + scheme.slice(PLACEHOLDER.name.length);

      moves.push([
        `${schemeDir}/${scheme}`,
        `ios/${target.name}.xcodeproj/xcshareddata/xcschemes/${renamed}`,
      ]);
    }
  }

  console.log('');

  for (const [from, to] of moves) {
    const source = path.join(root, from);
    const destination = path.join(root, to);

    if (!fs.existsSync(source) || source === destination) continue;

    console.log(`    move   ${from} -> ${to}`);

    if (!dryRun) {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.renameSync(source, destination);
    }
  }

  // Prune the now-empty placeholder package directories, deepest first, so
  // `java/com` does not linger when the new id is `org.acme`.
  if (!dryRun) {
    const segments = PLACEHOLDER.bundleId.split('.');
    for (let i = segments.length - 1; i >= 1; i -= 1) {
      const dir = path.join(
        root,
        'android',
        'app',
        'src',
        'main',
        'java',
        ...segments.slice(0, i),
      );
      if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
      }
    }
  }

  /**
   * Display name, applied after the generic pass.
   *
   * The generic replacement turns every "TemplateProject" into the project
   * name, which is correct for identifiers but wrong for the strings a user
   * actually sees when the display name differs. These are the three places
   * that show on a home screen.
   */
  if (target.displayName !== target.name) {
    const displayTargets = [
      {
        file: 'app.json',
        apply: content => {
          const json = JSON.parse(content);
          json.displayName = target.displayName;
          return `${JSON.stringify(json, null, 2)}\n`;
        },
      },
      {
        file: path.join(
          'android',
          'app',
          'src',
          'main',
          'res',
          'values',
          'strings.xml',
        ),
        // The generic pass has already turned this into the target *name*;
        // the display name may differ from it ("Acme" vs "AcmeApp"), and
        // only this one string carries the display name on Android.
        apply: content =>
          content.replace(
            `<string name="app_name">${target.name}</string>`,
            `<string name="app_name">${target.displayName}</string>`,
          ),
      },
      {
        file: path.join('ios', `${target.name}.xcodeproj`, 'project.pbxproj'),
        // Xcode omits the quotes when a value contains no spaces, so the
        // production entry reads `APP_DISPLAY_NAME = Acme;` after the
        // generic pass while the others stay quoted. Matching only the
        // quoted form silently skips it.
        apply: content =>
          content.replace(
            new RegExp(`APP_DISPLAY_NAME = "?${target.name}"?;`, 'g'),
            `APP_DISPLAY_NAME = "${target.displayName}";`,
          ),
      },
    ];

    for (const { file, apply } of displayTargets) {
      const full = path.join(root, file);
      if (!fs.existsSync(full)) continue;

      const content = fs.readFileSync(full, 'utf8');
      const updated = apply(content);
      if (updated === content) continue;

      console.log(`    edit   ${file} (display name)`);
      if (!dryRun) fs.writeFileSync(full, updated);
    }
  }

  // The lockfile's own name field, and nothing else in it: a blanket
  // replacement would rewrite unrelated package names.
  const lockfile = path.join(root, 'package-lock.json');
  if (fs.existsSync(lockfile)) {
    const lock = JSON.parse(fs.readFileSync(lockfile, 'utf8'));
    if (lock.name === PLACEHOLDER.name) {
      lock.name = target.name;
      if (lock.packages?.['']) lock.packages[''].name = target.name;
      console.log('    edit   package-lock.json (name field only)');
      if (!dryRun) {
        fs.writeFileSync(lockfile, `${JSON.stringify(lock, null, 2)}\n`);
      }
    }
  }

  console.log(`\n  ${filesChanged} file(s) rewritten.\n`);

  if (dryRun) {
    console.log('  Dry run: nothing was written.\n');
    return;
  }

  /**
   * Remove this script.
   *
   * It is the only remaining file carrying the placeholder identity, and
   * rule 55 requires a generated project to contain no template-only
   * references. Renaming a second time is not meaningful, so keeping it
   * around only invites someone to run it against an already-renamed
   * project. Pass --keep-script to retain it.
   */
  if (args['keep-script'] === undefined) {
    console.log('    remove scripts/rename.js');
    fs.unlinkSync(path.join(root, 'scripts', 'rename.js'));
  }

  console.log('  Next:');
  console.log(
    '    rm -rf ios/Pods ios/build android/.gradle android/app/build',
  );
  console.log('    npm install');
  console.log('    bundle exec pod install --project-directory=ios');
  console.log('    npm run validate\n');
};

main();
