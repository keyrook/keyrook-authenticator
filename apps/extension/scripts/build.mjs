import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, readdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { firefoxManifest, GECKO_ID } from './firefox.mjs';
import { buildManifest } from './manifest.mjs';
import { accountPageFor, accountRpFor, EDGE_PUBLIC_KEY, PRODUCTION_SYNC_API_URL } from './release.mjs';
import { DEFAULT_LOCALE, localeFiles } from './store-locales.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));


function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: 'inherit' });
}

const asEdge = process.argv.includes('--as-edge');
if (asEdge && process.argv.includes('--zip')) {
  throw new Error('--as-edge is for loading unpacked; a store upload must not carry a key.');
}

// Chrome's build, which Edge and Opera take as it is, or Firefox's. Each has a
// folder of its own, so building one never leaves the other half-replaced.
const browser = process.argv.includes('--browser') ? process.argv[process.argv.indexOf('--browser') + 1] : 'chrome';
if (browser !== 'chrome' && browser !== 'firefox') throw new Error(`No build for --browser ${browser}: chrome or firefox.`);
const firefox = browser === 'firefox';
if (firefox && asEdge) throw new Error('--as-edge gives a Chrome build the Edge listing’s id; Firefox’s id is in its manifest.');
const dist = resolve(root, firefox ? 'dist-firefox' : 'dist');
process.env.VITE_BROWSER = browser;
console.log(`▸ For ${firefox ? 'Firefox' : 'Chrome, Edge and Opera'}`);

rmSync(dist, { recursive: true, force: true });

// The environment wins, including an empty value; otherwise the official
// server. Set here, once, so the bundle and the manifest's connect-src below
// cannot be built against two different answers. Firefox's the same: the
// server answers it once AUTHX_FIREFOX_ADDONS names its id (keyrook-account's
// docs/firefox.md).
const syncApiUrl = process.env.VITE_SYNC_API_URL ?? PRODUCTION_SYNC_API_URL;
process.env.VITE_SYNC_API_URL = syncApiUrl;
console.log(syncApiUrl ? `▸ Sync server: ${syncApiUrl}` : '▸ No sync server: account features off');
// Whose passkeys the pages may ask, and the host permission that lets them:
// one answer, for the bundle and the manifest alike. None on Firefox, where
// the server takes no passkey from an origin made on install.
const accountRp = firefox ? '' : accountRpFor(syncApiUrl);
process.env.VITE_ACCOUNT_RP = accountRp;
if (accountRp) console.log(`▸ The account's passkeys: ${accountRp}`);
const accountPage = accountPageFor(syncApiUrl);
process.env.VITE_ACCOUNT_PAGE_URL = accountPage;
if (accountPage) console.log(`▸ The account's page: ${accountPage}`);

// Firefox's folder, and code for the oldest Firefox it installs on rather
// than for Chrome. Chrome's build is told nothing it was not told before.
const forFirefox = firefox ? ['--outDir', 'dist-firefox', '--target', 'firefox140'] : [];

console.log(`\n▸ Building pages + ${firefox ? 'background page' : 'service worker'}`);
run('npx', ['vite', 'build', ...forFirefox]);

console.log('\n▸ Building content script');
run('npx', ['vite', 'build', '--config', 'vite.content.config.ts', ...forFirefox]);

console.log('\n▸ Writing manifest.json');
// The policy has to name the same origin the bundle was built against, or
// every sync call is blocked by the browser.
const syncOrigin = syncApiUrl ? new URL(syncApiUrl).origin : '';
if (syncOrigin) console.log(`  connect-src allows ${syncOrigin}`);
mkdirSync(dist, { recursive: true });
// The name and summary in the browser's language: Chrome and the stores read
// them from _locales. See store-locales.mjs.
const chromeManifest = buildManifest({
  version: pkg.version,
  name: '__MSG_appName__',
  description: '__MSG_appDescription__',
  defaultLocale: DEFAULT_LOCALE,
  syncOrigin,
  accountRp,
});
const manifest = firefox ? firefoxManifest(chromeManifest, { syncOrigin }) : chromeManifest;
if (firefox) console.log(`  add-on id ${GECKO_ID}`);
for (const { code, messages } of localeFiles()) {
  mkdirSync(resolve(dist, '_locales', code), { recursive: true });
  writeFileSync(resolve(dist, '_locales', code, 'messages.json'), `${JSON.stringify(messages, null, 2)}\n`);
}
if (asEdge) {
  // Loads with the Edge listing's id, which the sync server accepts.
  manifest.key = EDGE_PUBLIC_KEY;
  console.log('  key: Edge listing (id lnbabkbknabedpnmdihllnbhdmolianm) — not for upload');
}
writeFileSync(resolve(dist, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

if (process.argv.includes('--zip')) {
  const releases = resolve(root, '../../release');
  mkdirSync(releases, { recursive: true });
  const archive = resolve(releases, `keyrook-authenticator-${firefox ? 'firefox-' : ''}${pkg.version}.zip`);
  rmSync(archive, { force: true });
  console.log(`\n▸ Packaging ${archive}`);
  // Byte for byte the same archive from the same source, on any machine: a
  // store reviewer rebuilding from the published tag should get this file,
  // not merely the same contents. So every entry gets one fixed date, one
  // mode and a sorted place, and zip writes its DOS timestamps in UTC rather
  // than whatever zone the builder is in. -D leaves out directory entries,
  // -X macOS resource forks, which the Web Store rejects as unexpected files.
  const fixed = new Date('2020-01-01T00:00:00Z');
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else {
        chmodSync(path, 0o644);
        utimesSync(path, fixed, fixed);
        files.push(relative(dist, path).split(sep).join('/'));
      }
    }
  };
  walk(dist);
  files.sort();
  execFileSync('zip', ['-X', '-D', '-q', archive, '-@'], {
    cwd: dist,
    input: `${files.join('\n')}\n`,
    env: { ...process.env, TZ: 'UTC' },
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  console.log(`\n✓ Upload this to ${firefox ? 'addons.mozilla.org' : 'the Chrome Web Store'}: ${archive}`);
} else if (firefox) {
  // A temporary add-on lasts until Firefox closes; nothing signs it here.
  console.log(`\n✓ In Firefox, about:debugging → This Firefox → Load Temporary Add-on: ${resolve(dist, 'manifest.json')}`);
} else {
  console.log(`\n✓ Load unpacked from: ${dist}`);
}
