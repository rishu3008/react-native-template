#!/usr/bin/env node
/**
 * Verify every arm64 native library is 16 KB page-size aligned (AGENTS.md 34).
 *
 * Android 15 devices can use 16 KB memory pages. A library whose PT_LOAD
 * segments are aligned to only 4096 fails to load there, and the crash
 * appears on those devices alone -- which is exactly the kind of failure that
 * reaches production because it never reproduced locally.
 *
 * Rule 34 requires this for every native dependency, not React Native alone,
 * so it reads the built APK rather than any declared list.
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REQUIRED_ALIGNMENT = 16384;
const PT_LOAD = 1;

const findApk = () => {
  const root = path.join('android', 'app', 'build', 'outputs', 'apk');
  const found = [];

  const walk = dir => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.apk')) found.push(full);
    }
  };

  walk(root);

  if (found.length === 0) {
    throw new Error(`No APK found under ${root}. Build one first.`);
  }

  // Newest, so a stale artifact from an earlier build is never checked.
  return found.sort(
    (a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs,
  )[0];
};

const minLoadAlignment = buffer => {
  if (buffer.readUInt32BE(0) !== 0x7f454c46) return null;

  const phoff = Number(buffer.readBigUInt64LE(0x20));
  const phentsize = buffer.readUInt16LE(0x36);
  const phnum = buffer.readUInt16LE(0x38);

  const alignments = [];
  for (let i = 0; i < phnum; i += 1) {
    const offset = phoff + i * phentsize;
    if (buffer.readUInt32LE(offset) === PT_LOAD) {
      alignments.push(Number(buffer.readBigUInt64LE(offset + 0x30)));
    }
  }

  return alignments.length > 0 ? Math.min(...alignments) : null;
};

const main = () => {
  const apk = findApk();
  const workdir = fs.mkdtempSync(path.join(os.tmpdir(), 'apk-align-'));

  execSync(`unzip -q -o "${path.resolve(apk)}" 'lib/arm64-v8a/*'`, {
    cwd: workdir,
    stdio: 'pipe',
  });

  const libDir = path.join(workdir, 'lib', 'arm64-v8a');

  if (!fs.existsSync(libDir)) {
    console.log(`No arm64 libraries in ${apk}; nothing to check.`);
    return;
  }

  const failures = [];
  let checked = 0;

  for (const name of fs.readdirSync(libDir).filter(f => f.endsWith('.so'))) {
    const alignment = minLoadAlignment(
      fs.readFileSync(path.join(libDir, name)),
    );
    if (alignment == null) continue;

    checked += 1;
    if (alignment < REQUIRED_ALIGNMENT) failures.push({ name, alignment });
  }

  console.log(`Checked ${checked} arm64 libraries in ${path.basename(apk)}`);

  if (failures.length > 0) {
    for (const { name, alignment } of failures) {
      console.error(`  NOT 16 KB ALIGNED: ${name} (p_align=${alignment})`);
    }
    console.error(
      `\n${failures.length} library/libraries would fail to load on a 16 KB page-size device.`,
    );
    process.exit(1);
  }

  console.log('All libraries are aligned to at least 16384 bytes.');
};

main();
