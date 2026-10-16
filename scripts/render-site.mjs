/**
 * Builds the site's code page — https://keyrook.com/authenticator/code/ —
 * from its template and its script, and keeps the intro page's policy current:
 *
 *   site/src/code.html + site/src/code.ts  →  site/keyrook.com/authenticator/code/index.html
 *   site/keyrook.com/authenticator/index.html           its Content Security Policy, from its script
 *   both                                                 Keyrook's tokens and icons (scripts/site-brand.mjs)
 *
 *   node scripts/render-site.mjs            write it
 *   node scripts/render-site.mjs --check    fail if it is out of date (CI)
 *
 * The script is bundled from @authx/core's own OTP code, so the page and the
 * extension cannot disagree about a code, and inlined: the page loads nothing.
 * Its hash goes into the page's Content Security Policy, which is what lets
 * the page say a pasted key cannot leave it — no connections are allowed, and
 * no script runs but this one. A hash written by hand would be wrong by the
 * next edit; this one cannot be.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { withBrand } from './site-brand.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = resolve(ROOT, 'site/src/code.html');
const ENTRY = resolve(ROOT, 'site/src/code.ts');
const OUT = resolve(ROOT, 'site/keyrook.com/authenticator/code/index.html');
const INTRO = resolve(ROOT, 'site/keyrook.com/authenticator/index.html');

const sha256 = (text) => createHash('sha256').update(text, 'utf8').digest('base64');

/**
 * Every page allows no connection and no script but its own, so a script
 * injected into a page on its way to the browser does not run.
 */
const policy = (scriptHash, { video = false } = {}) =>
  [
    "default-src 'none'",
    `script-src 'sha256-${scriptHash}'`,
    "style-src 'unsafe-inline'",
    // The intro page plays the promo video from its own folder: the poster is
    // an image, the film and its captions are media. Still nothing from any
    // other host, so watching it tells no one but keyrook.com.
    video ? "img-src data: 'self'" : 'img-src data:',
    ...(video ? ["media-src 'self'"] : []),
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');

const bundled = await build({
  entryPoints: [ENTRY],
  bundle: true,
  write: false,
  format: 'iife',
  target: 'es2020',
  minify: true,
  legalComments: 'none',
  charset: 'utf8',
});
const script = bundled.outputFiles[0].text.trim();
if (script.includes('</script')) throw new Error('The bundle contains "</script" and cannot be inlined.');

const csp = policy(sha256(script));

const template = readFileSync(TEMPLATE, 'utf8');
for (const slot of ['{{CSP}}', '{{SCRIPT}}']) {
  if (template.split(slot).length !== 2) throw new Error(`${slot} must appear exactly once in the template.`);
}
// Replaced with functions: the minified script is full of `$&` and `$'`,
// which a replacement string would expand.
const page = withBrand(template, 'site/src/code.html').replace('{{CSP}}', () => csp).replace('{{SCRIPT}}', () => script);

// The intro page is edited by hand; only its policy is written here, from
// the one inline script it has.
const intro = withBrand(readFileSync(INTRO, 'utf8'), 'the intro page');
const introScripts = [...intro.matchAll(/<script data-cfasync="false">([\s\S]*?)<\/script>/g)];
if (introScripts.length !== 1 || intro.split('<script').length !== 2) {
  throw new Error('The intro page must have exactly one script, as <script data-cfasync="false">.');
}
const introPage = intro.replace(
  /<meta http-equiv="Content-Security-Policy" content="[^"]*">/,
  () => `<meta http-equiv="Content-Security-Policy" content="${policy(sha256(introScripts[0][1]), { video: true })}">`,
);
if (introPage === intro && !intro.includes(policy(sha256(introScripts[0][1]), { video: true }))) {
  throw new Error('The intro page has no Content-Security-Policy <meta> to fill in.');
}

const outputs = [
  [OUT, page],
  [INTRO, introPage],
];
if (process.argv.includes('--check')) {
  let stale = false;
  for (const [path, contents] of outputs) {
    if (!existsSync(path) || readFileSync(path, 'utf8') !== contents) {
      console.error(`✗ ${relative(ROOT, path)} is out of date. Run: node scripts/render-site.mjs`);
      stale = true;
    }
  }
  if (stale) process.exit(1);
  console.log('✓ the site pages match site/src and their scripts');
} else {
  for (const [path, contents] of outputs) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, contents);
    console.log(`✓ ${relative(ROOT, path)}`);
  }
}
