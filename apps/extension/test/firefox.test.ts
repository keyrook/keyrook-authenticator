import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * The Firefox build's manifest, made from Chrome's (scripts/firefox.mjs), and
 * what check-release holds a Firefox release to. Each way past the check that
 * would reach the store is tried here.
 */
const ROOT = resolve(import.meta.dirname, '..');
const REPO = resolve(ROOT, '../..');
const load = (name: string) => import(pathToFileURL(resolve(ROOT, 'scripts', name)).href);

type Manifest = Record<string, any>;
let chrome: Manifest;
let firefox: Manifest;
let local: Manifest;
let scratch: string;

beforeAll(async () => {
  const { buildManifest } = await load('manifest.mjs');
  const { firefoxManifest } = await load('firefox.mjs');
  const { PRODUCTION_ACCOUNT_RP, PRODUCTION_SYNC_API_URL } = await load('release.mjs');
  // A store build of Chrome's, as the Firefox one is made from it.
  chrome = buildManifest({
    version: '0.4.2',
    name: 'Keyrook Authenticator',
    description: 'Codes',
    syncOrigin: new URL(PRODUCTION_SYNC_API_URL).origin,
    accountRp: PRODUCTION_ACCOUNT_RP,
  });
  // What build.mjs makes for Firefox: the official server, and no account passkeys.
  const syncOrigin = new URL(PRODUCTION_SYNC_API_URL).origin;
  const made = buildManifest({ version: '0.4.2', name: 'Keyrook Authenticator', description: 'Codes', syncOrigin });
  firefox = firefoxManifest(made, { syncOrigin });
  // And with `VITE_SYNC_API_URL=` (empty): no account at all.
  const unsynced = buildManifest({ version: '0.4.2', name: 'Keyrook Authenticator', description: 'Codes', syncOrigin: '' });
  local = firefoxManifest(unsynced, { syncOrigin: '' });
  mkdirSync(resolve(REPO, '.tmp'), { recursive: true });
  scratch = mkdtempSync(join(REPO, '.tmp', 'firefox-'));
});

afterAll(() => rmSync(scratch, { recursive: true, force: true }));

/** What check-release says of a manifest: null when it passes, its complaint when it refuses. */
function checkRelease(manifest: Manifest, browser: 'chrome' | 'firefox' = 'firefox'): string | null {
  const path = join(scratch, `${Math.random().toString(36).slice(2)}.json`);
  writeFileSync(path, JSON.stringify(manifest));
  try {
    execFileSync('node', [resolve(REPO, 'scripts/check-release.mjs'), path, '--browser', browser], { stdio: 'pipe' });
    return null;
  } catch (error) {
    return String((error as { stderr?: Buffer }).stderr ?? error);
  }
}

describe('the Firefox manifest', () => {
  it('runs the background as an event page, which is all Firefox has', () => {
    expect(firefox.background).toEqual({ scripts: ['background.js'], type: 'module' });
    expect(firefox.minimum_chrome_version).toBeUndefined();
  });

  it('carries the add-on id, the first Firefox with built-in data consent, and the account’s data as optional', () => {
    expect(firefox.browser_specific_settings).toEqual({
      gecko: {
        id: 'authenticator@keyrook.com',
        strict_min_version: '140.0',
        // Nothing at install: the click that starts a sign-in asks for it.
        data_collection_permissions: {
          required: ['none'],
          optional: ['authenticationInfo', 'personallyIdentifyingInfo', 'technicalAndInteraction'],
        },
      },
    });
  });

  it('keeps every permission rule of the Chrome build, and reaches the sync server', () => {
    expect(firefox.host_permissions).toBeUndefined();
    expect(firefox.optional_host_permissions).toBeUndefined();
    expect(firefox.content_scripts).toBeUndefined();
    expect(firefox.externally_connectable).toBeUndefined();
    expect(firefox.permissions).toEqual(chrome.permissions);
    expect(firefox.permissions).toContain('identity');
    expect(firefox.content_security_policy.extension_pages).toContain("connect-src 'self' https://api.keyrook.com;");
  });

  it('declares nothing, and asks for no sign-in window, built with no sync server', () => {
    expect(local.browser_specific_settings.gecko.data_collection_permissions).toEqual({ required: ['none'] });
    expect(local.permissions).not.toContain('identity');
    expect(local.content_security_policy.extension_pages).toContain("connect-src 'self';");
  });

  it('shares everything else with Chrome’s', () => {
    for (const key of ['action', 'icons', 'options_ui', 'commands', 'default_locale', 'manifest_version']) {
      expect(firefox[key], key).toEqual(chrome[key]);
    }
  });

  it('drops what only Chrome’s account uses even when made from a Chrome build that has it', async () => {
    const { firefoxManifest } = await load('firefox.mjs');
    const made = firefoxManifest(chrome, { syncOrigin: 'https://api.keyrook.com' });
    expect(made.externally_connectable).toBeUndefined();
    expect(made.optional_host_permissions).toBeUndefined();
    expect(made.minimum_chrome_version).toBeUndefined();
  });
});

describe('check-release, for Firefox', () => {
  it('passes the build as it is made', () => {
    expect(checkRelease(firefox)).toBeNull();
  });

  it('refuses a Chrome build checked as Firefox’s, and the reverse', () => {
    expect(checkRelease(chrome)).toMatch(/browser_specific_settings is null/);
    expect(checkRelease(firefox, 'chrome')).toMatch(/a Firefox build checked as Chrome/);
  });

  it('refuses a build with no account: a release reaches the official server', () => {
    expect(checkRelease(local)).toMatch(/connect-src is/);
  });

  it('refuses another add-on id, an older Firefox, or other data declared', () => {
    const gecko = firefox.browser_specific_settings.gecko;
    const declared = gecko.data_collection_permissions;
    const variants = [
      { ...gecko, id: 'keyrook-authenticator@keyrook.com' },
      { ...gecko, strict_min_version: '128.0' },
      // Less than is sent: Firefox would never let the rest be asked for.
      { ...gecko, data_collection_permissions: { required: ['none'] } },
      { ...gecko, data_collection_permissions: { ...declared, optional: ['authenticationInfo', 'personallyIdentifyingInfo'] } },
      // More, or any of it taken at install with no way to say no.
      { ...gecko, data_collection_permissions: { ...declared, optional: [...declared.optional, 'locationInfo'] } },
      { ...gecko, data_collection_permissions: { required: ['authenticationInfo'], optional: declared.optional } },
      { ...gecko, update_url: 'https://keyrook.com/authenticator/updates.json' },
      { id: gecko.id, strict_min_version: gecko.strict_min_version },
    ];
    for (const changed of variants) {
      expect(checkRelease({ ...firefox, browser_specific_settings: { gecko: changed } })).toMatch(/browser_specific_settings is/);
    }
  });

  it('refuses a service worker, which Firefox would not run', () => {
    expect(checkRelease({ ...firefox, background: { service_worker: 'background.js', type: 'module' } })).toMatch(/background is/);
  });

  it('refuses anything that reaches further: a host, another server, a page that may message it or load its files', () => {
    expect(checkRelease({ ...firefox, host_permissions: ['https://api.keyrook.com/*'] })).toMatch(/host_permissions declared/);
    expect(checkRelease({ ...firefox, optional_host_permissions: ['https://api.keyrook.com/*'] })).toMatch(/asks for no host/);
    expect(checkRelease({ ...firefox, optional_host_permissions: ['https://account.keyrook.com/*'] })).toMatch(/asks for no host/);
    expect(checkRelease({ ...firefox, permissions: [...firefox.permissions, 'tabs'] })).toMatch(/not justified.*tabs/);
    for (const server of ['http://localhost:8799', 'https://api-staging.keyrook.com']) {
      expect(
        checkRelease({
          ...firefox,
          content_security_policy: {
            extension_pages: firefox.content_security_policy.extension_pages.replace('https://api.keyrook.com', server),
          },
        }),
      ).toMatch(/connect-src is/);
    }
    expect(checkRelease({ ...firefox, externally_connectable: { matches: ['https://api.keyrook.com/*'] } })).toMatch(/declares none/);
    expect(
      checkRelease({ ...firefox, web_accessible_resources: [{ resources: ['options.html'], matches: ['https://api.keyrook.com/*'] }] }),
    ).toMatch(/web_accessible_resources declared/);
    expect(checkRelease({ ...firefox, content_scripts: [{ matches: ['<all_urls>'], js: ['content.js'] }] })).toMatch(/content_scripts/);
  });
});
