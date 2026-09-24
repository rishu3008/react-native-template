#!/usr/bin/env node
/**
 * Register the fonts in src/assets/fonts with both native projects.
 *
 * A font in React Native has to be in three places to work: copied into the
 * Android assets directory, added to the Xcode target's resources, and listed
 * in Info.plist under UIAppFonts. Miss any one and the text silently falls
 * back to the system face on that platform only -- which is easy to ship
 * without noticing.
 *
 *   npm run fonts
 *   npm run fonts -- --check     # fail if anything is unregistered (for CI)
 *
 * Use the PostScript name as fontFamily. For these files it matches the
 * filename, which is why Android (filename) and iOS (PostScript name) can
 * share one value; a font whose two names differ needs a per-platform value.
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const FONT_DIR = path.join('src', 'assets', 'fonts');
const ANDROID_FONTS = path.join(
  'android',
  'app',
  'src',
  'main',
  'assets',
  'fonts',
);

const findIosProject = () => {
  const entries = fs
    .readdirSync('ios', { withFileTypes: true })
    .filter(e => e.isDirectory() && e.name.endsWith('.xcodeproj'));

  if (entries.length === 0) throw new Error('No .xcodeproj found under ios/.');
  return entries[0].name.replace('.xcodeproj', '');
};

const fontFiles = () => {
  if (!fs.existsSync(FONT_DIR)) return [];
  return fs
    .readdirSync(FONT_DIR)
    .filter(f => ['.ttf', '.otf'].includes(path.extname(f).toLowerCase()))
    .sort();
};

const linkAndroid = (fonts, check) => {
  const stale = [];

  for (const font of fonts) {
    const destination = path.join(ANDROID_FONTS, font);
    const source = path.join(FONT_DIR, font);

    const upToDate =
      fs.existsSync(destination) &&
      fs.readFileSync(destination).equals(fs.readFileSync(source));

    if (upToDate) continue;

    if (check) {
      stale.push(font);
      continue;
    }

    fs.mkdirSync(ANDROID_FONTS, { recursive: true });
    fs.copyFileSync(source, destination);
    console.log(`    copied   android/.../assets/fonts/${font}`);
  }

  // A font removed from src must not linger in the Android assets, or it
  // stays available on Android and not iOS.
  if (!check && fs.existsSync(ANDROID_FONTS)) {
    for (const existing of fs.readdirSync(ANDROID_FONTS)) {
      if (!fonts.includes(existing)) {
        fs.unlinkSync(path.join(ANDROID_FONTS, existing));
        console.log(`    removed  android/.../assets/fonts/${existing}`);
      }
    }
  }

  return stale;
};

const linkIosPlist = (fonts, project, check) => {
  const plist = path.join('ios', project, 'Info.plist');
  const read = () => {
    try {
      return execSync(
        `/usr/libexec/PlistBuddy -c "Print :UIAppFonts" "${plist}"`,
        { stdio: ['pipe', 'pipe', 'pipe'] },
      ).toString();
    } catch {
      return null;
    }
  };

  const current = read();
  const missing = fonts.filter(
    font => current == null || !current.includes(font),
  );

  if (missing.length === 0) return [];
  if (check) return missing;

  if (current == null) {
    execSync(`/usr/libexec/PlistBuddy -c "Add :UIAppFonts array" "${plist}"`);
  }

  for (const font of missing) {
    execSync(
      `/usr/libexec/PlistBuddy -c "Add :UIAppFonts: string '${font}'" "${plist}"`,
    );
    console.log(`    plist    UIAppFonts += ${font}`);
  }

  return [];
};

const linkIosProject = (fonts, project, check) => {
  // Xcode edits go through the xcodeproj gem rather than text surgery on the
  // pbxproj: the file is a graph of cross-referenced UUIDs, and hand-editing
  // it produces a project Xcode opens and then quietly ignores.
  const ruby = `
    require 'xcodeproj'
    project = Xcodeproj::Project.open('ios/${project}.xcodeproj')
    target  = project.targets.find { |t| t.name == '${project}' }
    group   = project.main_group.children.find { |g| g.display_name == '${project}' }
    abort('target or group not found') if target.nil? || group.nil?

    fonts = %w[${fonts.join(' ')}]
    existing = target.resources_build_phase.files_references.map { |r| File.basename(r.path.to_s) }
    missing = fonts.reject { |f| existing.include?(f) }

    if ${check ? 'true' : 'false'}
      puts missing.join(' ')
    else
      missing.each do |font|
        ref = group.new_file("../src/assets/fonts/#{font}")
        target.resources_build_phase.add_file_reference(ref)
        puts "    xcode    resources += #{font}"
      end
      project.save unless missing.empty?
    end
  `;

  // Written to a file rather than passed with -e: a multi-line script
  // through the shell needs escaping that differs between node's quoting and
  // ruby's parser, and gets it wrong.
  const scriptPath = path.join(
    fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'fonts-')),
    'link.rb',
  );
  fs.writeFileSync(scriptPath, ruby);

  let output;
  try {
    output = execSync(`bundle exec ruby "${scriptPath}"`, {
      stdio: ['pipe', 'pipe', 'inherit'],
    })
      .toString()
      .trim();
  } finally {
    fs.rmSync(path.dirname(scriptPath), { recursive: true, force: true });
  }

  if (check) return output.length > 0 ? output.split(/\s+/) : [];

  if (output.length > 0) console.log(output);
  return [];
};

const main = () => {
  const check = process.argv.includes('--check');
  const fonts = fontFiles();
  const project = findIosProject();

  console.log(
    `\n  ${check ? 'Checking' : 'Linking'} ${fonts.length} font(s) for ${project}\n`,
  );

  if (fonts.length === 0) {
    console.log(`  No fonts in ${FONT_DIR}.\n`);
    return;
  }

  for (const font of fonts) console.log(`    ${font}`);
  console.log('');

  const stale = [
    ...linkAndroid(fonts, check).map(f => `android: ${f}`),
    ...linkIosPlist(fonts, project, check).map(f => `Info.plist: ${f}`),
    ...linkIosProject(fonts, project, check).map(f => `xcode: ${f}`),
  ];

  if (check && stale.length > 0) {
    console.error('\n  Unregistered fonts:');
    for (const entry of stale) console.error(`    ${entry}`);
    console.error('\n  Run `npm run fonts`.\n');
    process.exit(1);
  }

  if (!check) {
    console.log(
      '\n  Done. Rebuild both platforms: adding a font changes the native bundle,\n' +
        '  so a Metro reload will not pick it up.\n',
    );
  }
};

main();
