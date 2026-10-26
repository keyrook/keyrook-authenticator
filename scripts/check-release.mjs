/**
 * Refuse to call a build a release if it breaks what the store reviewer checks
 * first. Run against `apps/extension/dist` after `npm run zip`.
 *
 * Two of the extension's permission invariants (see docs/architecture.md) are
 * only visible in the built manifest, so this is where they are enforced
 * rather than trusted:
 *
 * - No `host_permissions` and no declarative `content_scripts`. Ever. This is
 *   what keeps "read and change all your data on all websites" off the listing.
 * - One optional host permission, the Keyrook account's page, and no other:
 *   Chrome asks for it only when someone signs in with one of the account's
 *   passkeys, and it shows nothing at install.
 * - No permission beyond the ones the stores were given reasons for.
 * - `externally_connectable` lets the official sync server's pages message
 *   the extension, and no other site.
 * - `connect-src` names 'self' and the official sync server, nothing else —
 *   the origin in apps/extension/scripts/release.mjs, which the privacy policy
 *   and both stores' privacy answers describe. Not localhost because someone
 *   ran the e2e suite last, and not a build with sync quietly switched off.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PRODUCTION_ACCOUNT_RP, PRODUCTION_SYNC_API_URL } from '../apps/extension/scripts/release.mjs';

const path = resolve(process.argv[2] ?? 'apps/extension/dist/manifest.json');
const manifest = JSON.parse(readFileSync(path, 'utf8'));
const failures = [];

if (manifest.host_permissions) {
  failures.push(`host_permissions declared: ${JSON.stringify(manifest.host_permissions)}`);
}
// The account page's passkeys, and nothing else: a wider pattern would be a
// host permission on sites this app has no business on, granted by one click
// meant for a passkey.
const optionalHosts = JSON.stringify(manifest.optional_host_permissions ?? null);
const expectedOptionalHosts = JSON.stringify([`https://${PRODUCTION_ACCOUNT_RP}/*`]);
if (optionalHosts !== expectedOptionalHosts) {
  failures.push(`optional_host_permissions is ${optionalHosts}; a release may ask for the account page alone: ${expectedOptionalHosts}`);
}
if (manifest.key) {
  failures.push('manifest carries a "key": a build:as-edge build for loading unpacked, not for a store');
}
if (manifest.content_scripts) {
  failures.push('declarative content_scripts present; autofill must stay on activeTab');
}
// The permissions the listing and both stores' answers justify, and no more.
// Anything new here is a decision to make on purpose — with its justification
// written for the stores — not something that slips into a build.
const ALLOWED = new Set(['storage', 'alarms', 'activeTab', 'scripting', 'clipboardWrite', 'identity']);
const extra = (manifest.permissions ?? []).filter((permission) => !ALLOWED.has(permission));
if (extra.length > 0) failures.push(`permissions not justified to the stores: ${extra.join(', ')}`);

const csp = manifest.content_security_policy?.extension_pages ?? '';
const connect = csp.match(/connect-src ([^;]+)/)?.[1]?.trim();
const expected = `'self' ${new URL(PRODUCTION_SYNC_API_URL).origin}`;
if (connect !== expected) {
  failures.push(`connect-src is "${connect ?? 'missing'}"; a release reaches itself and its sync server: "${expected}"`);
}

// Only the sync server's own pages may message the extension: a wider match
// would let any site that matched hand it a sign-in answer.
const reachable = JSON.stringify(manifest.externally_connectable ?? null);
const expectedReach = JSON.stringify({ matches: [`${new URL(PRODUCTION_SYNC_API_URL).origin}/*`] });
if (reachable !== expectedReach) {
  failures.push(`externally_connectable is ${reachable}; only the sync server may message the extension: ${expectedReach}`);
}

if (failures.length > 0) {
  console.error(`✗ ${path} is not a release build:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `✓ ${manifest.name} ${manifest.version}: permissions ${JSON.stringify(manifest.permissions)}, connect-src ${expected}, no host permissions, optional ${expectedOptionalHosts}`,
);
