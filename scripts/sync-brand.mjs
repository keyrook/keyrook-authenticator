/**
 * Copies Keyrook's brand kit from the repository that owns it, keyrook-brand,
 * into vendor/keyrook-brand/.
 *
 *   node scripts/sync-brand.mjs            copy it
 *   node scripts/sync-brand.mjs --check    fail if the copy differs from the source
 *
 * The brand is decided in one place. This repository takes the drawings' source
 * (src/) and the generated kit (brand.css, assets/) as they are, so a colour
 * or a line is never retyped here: a new look is a change there, a re-render
 * there, and a sync here. The source is ../keyrook-brand beside this
 * repository, or KEYROOK_BRAND when it lives elsewhere.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE = resolve(process.env.KEYROOK_BRAND ?? join(ROOT, '../keyrook-brand'));
const TARGET = join(ROOT, 'vendor/keyrook-brand');
// package.json carries `sideEffects`: without it the bundler keeps every drawing
// a page imports nothing from, and the extension grows by the marks it never shows.
const PARTS = ['src', 'brand.css', 'assets', 'package.json', 'LICENSE', 'README.md'];
// Written by this script, not copied: which commit the kit came from.
const FROM = 'FROM';
const CHECK = process.argv.includes('--check');

if (!existsSync(join(SOURCE, 'src/tokens.ts'))) {
  console.error(`✗ No brand kit at ${SOURCE}. Clone keyrook-brand beside this repository, or set KEYROOK_BRAND.`);
  process.exit(1);
}

function files(base, part) {
  const path = join(base, part);
  if (!existsSync(path)) return [];
  if (!statSync(path).isDirectory()) return [part];
  return readdirSync(path)
    .filter((name) => name !== '.DS_Store')
    .flatMap((name) => files(base, join(part, name)));
}

const wanted = new Map(PARTS.flatMap((part) => files(SOURCE, part)).map((file) => [file, readFileSync(join(SOURCE, file))]));
const present = existsSync(TARGET) ? files(TARGET, '.').map((file) => relative('.', file)).filter((file) => file !== FROM) : [];

if (CHECK) {
  const stale = [
    ...[...wanted].filter(([file, bytes]) => !existsSync(join(TARGET, file)) || !readFileSync(join(TARGET, file)).equals(bytes)),
    ...present.filter((file) => !wanted.has(file)).map((file) => [file]),
  ].map(([file]) => file);
  if (stale.length) {
    for (const file of stale) console.error(`✗ vendor/keyrook-brand/${file} differs from ${relative(ROOT, SOURCE)}`);
    console.error('Run: node scripts/sync-brand.mjs');
    process.exit(1);
  }
  console.log(`✓ vendor/keyrook-brand matches ${relative(ROOT, SOURCE)}`);
} else {
  for (const file of present) if (!wanted.has(file)) rmSync(join(TARGET, file));
  for (const [file, bytes] of wanted) {
    mkdirSync(dirname(join(TARGET, file)), { recursive: true });
    writeFileSync(join(TARGET, file), bytes);
  }
  const git = (...args) => execFileSync('git', ['-C', SOURCE, ...args], { encoding: 'utf8' }).trim();
  let from = 'not a git checkout';
  try {
    const dirty = git('status', '--porcelain', '--', '.') !== '';
    from = `keyrook-brand ${git('rev-parse', 'HEAD')}${dirty ? ', with uncommitted changes' : ''}`;
  } catch {}
  writeFileSync(join(TARGET, FROM), `${from}\n`);
  console.log(`✓ ${wanted.size} files from ${relative(ROOT, SOURCE)} (${from})`);
}
