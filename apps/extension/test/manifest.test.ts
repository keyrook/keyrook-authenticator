import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * The one optional host permission: the Keyrook account's page, whose
 * passkeys Chrome lets this extension ask only with it. A release asks for it
 * and nothing wider, and no host permission at install; check-release is
 * what holds that, so each way past it is tried here.
 */
const ROOT = resolve(import.meta.dirname, '..');
const REPO = resolve(ROOT, '../..');

type Manifest = Record<string, unknown> & { optional_host_permissions?: string[]; host_permissions?: string[] };
let buildManifest: (options: Record<string, unknown>) => Manifest;
let accountRpFor: (syncApiUrl: string) => string;
let accountPageFor: (syncApiUrl: string) => string;
let PRODUCTION_SYNC_API_URL: string;
let STAGING_SYNC_API_URL: string;
// Inside the repository, as everything a test writes is.
let scratch: string;

beforeAll(async () => {
  ({ buildManifest } = await import(pathToFileURL(resolve(ROOT, 'scripts/manifest.mjs')).href));
  ({ accountRpFor, accountPageFor, PRODUCTION_SYNC_API_URL, STAGING_SYNC_API_URL } = await import(
    pathToFileURL(resolve(ROOT, 'scripts/release.mjs')).href
  ));
  mkdirSync(resolve(REPO, '.tmp'), { recursive: true });
  scratch = mkdtempSync(join(REPO, '.tmp', 'manifest-'));
});

afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const built = (syncApiUrl: string) =>
  buildManifest({
    version: '0.4.1',
    name: 'Keyrook Authenticator',
    description: 'Codes',
    syncOrigin: syncApiUrl ? new URL(syncApiUrl).origin : '',
    accountRp: accountRpFor(syncApiUrl),
  });

/** What check-release says of a manifest: null when it passes, its complaint when it refuses. */
function checkRelease(manifest: Manifest): string | null {
  const path = join(scratch, `${Math.random().toString(36).slice(2)}.json`);
  writeFileSync(path, JSON.stringify(manifest));
  try {
    execFileSync('node', [resolve(REPO, 'scripts/check-release.mjs'), path], { stdio: 'pipe' });
    return null;
  } catch (error) {
    return String((error as { stderr?: Buffer }).stderr ?? error);
  }
}

describe('the account page’s passkeys, in the manifest', () => {
  it('belong to the account page for the official server and for staging, to localhost for the kit, and to nobody else', () => {
    expect(accountRpFor(PRODUCTION_SYNC_API_URL)).toBe('account.keyrook.com');
    expect(accountRpFor(STAGING_SYNC_API_URL)).toBe('account-staging.keyrook.com');
    expect(accountRpFor('http://localhost:8799')).toBe('localhost');
    expect(accountRpFor('http://127.0.0.1:8799')).toBe('localhost');
    expect(accountRpFor('https://sync.example.com')).toBe('');
    expect(accountRpFor('')).toBe('');
  });

  it('staging means its whole origin, not an address that looks like it', () => {
    for (const lookalike of [
      'http://api-staging.keyrook.com',
      'https://api-staging.keyrook.com:8443',
      'https://api-staging.keyrook.com.example.com',
      'https://api-staging.example.com',
    ]) {
      expect(accountRpFor(lookalike)).toBe('');
    }
  });

  it('only staging’s build links a page of its own: the rest link the official one, and no bundle names staging’s', () => {
    expect(accountPageFor(STAGING_SYNC_API_URL)).toBe('https://account-staging.keyrook.com');
    for (const server of [PRODUCTION_SYNC_API_URL, 'http://localhost:8799', 'https://sync.example.com', '']) {
      expect(accountPageFor(server)).toBe('');
    }
  });

  it('a release asks for the account page only when asked, and for no host at install', () => {
    const manifest = built(PRODUCTION_SYNC_API_URL);
    expect(manifest.optional_host_permissions).toEqual(['https://account.keyrook.com/*']);
    expect(manifest.host_permissions).toBeUndefined();
    expect(checkRelease(manifest)).toBeNull();
  });

  it('a build with no account features asks for nothing', () => {
    const manifest = built('');
    expect(manifest.optional_host_permissions).toBeUndefined();
    expect(manifest.host_permissions).toBeUndefined();
  });

  it('check-release refuses the localhost build, which holds its host from install', () => {
    const manifest = built('http://localhost:8799');
    expect(manifest.host_permissions).toEqual(['https://localhost/*']);
    expect(checkRelease(manifest)).toMatch(/host_permissions declared/);
  });

  it('check-release refuses a build against staging, whichever part of the manifest shows it', () => {
    const staging = built(STAGING_SYNC_API_URL);
    const release = built(PRODUCTION_SYNC_API_URL);
    const refusal = checkRelease(staging);
    expect(refusal).toMatch(/connect-src is/);
    expect(refusal).toMatch(/externally_connectable is/);
    expect(refusal).toMatch(/optional_host_permissions is/);
    // One at a time, so no check stands behind another: a zip that kept any
    // single staging value still goes no further.
    expect(checkRelease({ ...release, content_security_policy: staging.content_security_policy })).toMatch(/connect-src is/);
    expect(checkRelease({ ...release, externally_connectable: staging.externally_connectable })).toMatch(/externally_connectable is/);
    expect(checkRelease({ ...release, optional_host_permissions: staging.optional_host_permissions })).toMatch(/optional_host_permissions is/);
  });

  it('check-release refuses a wider optional host, a second one, or none', () => {
    const release = built(PRODUCTION_SYNC_API_URL);
    for (const optional of [['https://*/*'], ['https://account.keyrook.com/*', 'https://keyrook.com/*'], ['<all_urls>'], undefined]) {
      expect(checkRelease({ ...release, optional_host_permissions: optional })).toMatch(/optional_host_permissions is/);
    }
  });
});
