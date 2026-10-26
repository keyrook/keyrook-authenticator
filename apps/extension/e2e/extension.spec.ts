import { createHmac } from 'node:crypto';
import type { BrowserContext, Page, Worker } from '@playwright/test';
import { base32Bytes, createDeviceVault, expect, migrationUri, openOptions, openPopup, saveRecoveryKey, test } from './fixtures.js';

const SECRET = 'JBSWY3DPEHPK3PXP';
const SETUP_URI = `otpauth://totp/GitHub:octocat@example.com?secret=${SECRET}&issuer=GitHub`;
const MASTER_PASSWORD = 'a real master password';

/** TOTP computed with node:crypto — independent of the WebCrypto path under test. */
function expectedCode(base32: string, atMs = Date.now()): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(atMs / 1000 / 30)));
  const digest = createHmac('sha1', base32Bytes(base32)).update(counter).digest();
  const offset = digest[digest.length - 1]! & 0x0f;
  const binary =
    ((digest[offset]! & 0x7f) << 24) |
    (digest[offset + 1]! << 16) |
    (digest[offset + 2]! << 8) |
    digest[offset + 3]!;
  return String(binary % 1_000_000).padStart(6, '0');
}

async function addAccount(page: Page, uri: string) {
  await page.getByTitle('Add account').click();
  await page.getByRole('button', { name: /Enter a setup key manually/ }).click();
  await page.getByLabel('Setup key').fill(uri);
  await page.locator('form').getByRole('button', { name: 'Add account' }).click();
}

test('the extension loads and its service worker starts', async ({ worker, extensionId }) => {
  expect(extensionId).toMatch(/^[a-p]{32}$/);
  expect(worker.url()).toBe(`chrome-extension://${extensionId}/background.js`);

  const manifest = await worker.evaluate(() => chrome.runtime.getManifest());
  expect(manifest.manifest_version).toBe(3);
  // The permission set is the product decision most likely to be eroded by a
  // careless change, and the one that governs the store's scariest warning.
  expect([...(manifest.permissions ?? [])].sort()).toEqual([
    'activeTab',
    'alarms',
    'clipboardWrite',
    'identity',
    'scripting',
    'storage',
  ]);
  // No host at install, but in a build against the kit's server on this
  // machine: the site its passkeys belong to, which this suite cannot answer
  // Chrome's question for. Optional, and only the account page's, in a
  // release — scripts/check-release.mjs refuses anything else.
  const local = /connect-src[^;]*localhost/.test(manifest.content_security_policy?.extension_pages ?? '');
  expect(manifest.host_permissions ?? []).toEqual(local ? ['https://localhost/*'] : []);
  expect(manifest.optional_host_permissions ?? []).toEqual([local ? 'https://localhost/*' : 'https://account.keyrook.com/*']);
  expect(manifest.content_scripts ?? []).toEqual([]);
});

test('first run creates a device-protected vault with a non-extractable key', async ({
  context,
  extensionId,
  worker,
}) => {
  const page = await openPopup(context, extensionId);
  await expect(page.getByRole('heading', { name: 'Keyrook Authenticator' })).toBeVisible();
  await createDeviceVault(page);

  const stored = await worker.evaluate(async () => {
    const all = await chrome.storage.local.get('authx.vault');
    return all['authx.vault'] as { protection: { mode: string; kdf: unknown } };
  });
  expect(stored.protection.mode).toBe('device');
  expect(stored.protection.kdf).toBeNull();

  // Try to steal the key the way an attacker with script execution would.
  const exfiltration = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((res, rej) => {
      const request = indexedDB.open('authx-keys', 1);
      request.onsuccess = () => res(request.result);
      request.onerror = () => rej(request.error);
    });
    const key = await new Promise<CryptoKey>((res, rej) => {
      const request = db.transaction('kek', 'readonly').objectStore('kek').get('device');
      request.onsuccess = () => res(request.result as CryptoKey);
      request.onerror = () => rej(request.error);
    });
    try {
      await crypto.subtle.exportKey('raw', key);
      return { extractable: key.extractable, result: 'LEAKED' };
    } catch (error) {
      return { extractable: key.extractable, result: (error as Error).name };
    }
  });

  expect(exfiltration.extractable).toBe(false);
  expect(exfiltration.result).toBe('InvalidAccessError');
});

test('an added account produces the right code and is encrypted at rest', async ({
  context,
  extensionId,
  worker,
}) => {
  const page = await openPopup(context, extensionId);
  await createDeviceVault(page);
  await addAccount(page, SETUP_URI);

  await expect(page.getByText('GitHub').first()).toBeVisible();
  const shown = (await page.locator('.code-digits').first().innerText()).replace(/\s/g, '');
  // Accept the neighbouring step in case the clock rolled between render and read.
  expect([expectedCode(SECRET), expectedCode(SECRET, Date.now() - 30_000)]).toContain(shown);

  const raw = await worker.evaluate(async () =>
    JSON.stringify(await chrome.storage.local.get('authx.vault')),
  );
  expect(raw).not.toContain(SECRET);
  expect(raw).not.toContain('octocat@example.com');
});

test('a device-protected vault reopens without any prompt', async ({ context, extensionId }) => {
  const page = await openPopup(context, extensionId);
  await createDeviceVault(page);
  await addAccount(page, SETUP_URI);
  await expect(page.getByText('GitHub').first()).toBeVisible();

  await page.reload();
  await expect(page.getByText('GitHub').first()).toBeVisible();
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
});

/**
 * Chrome tears an idle MV3 worker down on its own schedule. Killing it
 * outright is the same event, on demand: this is the case the "rehydrate from
 * storage on every message" design exists for, and no amount of stubbing can
 * prove it.
 */
async function killWorker(context: BrowserContext, page: Page, worker: Worker) {
  const cdp = await context.newCDPSession(page);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const swTarget = targetInfos.find((target) => target.type === 'service_worker');
  expect(swTarget, 'expected a service worker target').toBeTruthy();
  await cdp.send('Target.closeTarget', { targetId: swTarget!.targetId });
  await worker.waitForEvent('close', { timeout: 15_000 }).catch(() => undefined);
}

test('the vault survives the service worker being killed', async ({
  context,
  extensionId,
  worker,
}) => {
  const page = await openPopup(context, extensionId);
  await createDeviceVault(page);
  await addAccount(page, SETUP_URI);
  await expect(page.getByText('GitHub').first()).toBeVisible();

  await killWorker(context, page, worker);

  const revived = await openPopup(context, extensionId);
  await expect(revived.getByText('GitHub').first()).toBeVisible();
  await expect(revived.locator('.code-digits')).toHaveCount(1);
});

test('a master password can be added, then locks and unlocks the vault', async ({
  context,
  extensionId,
}) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  await addAccount(popup, SETUP_URI);

  const options = await openOptions(context, extensionId);
  await options.getByRole('button', { name: 'Security', exact: true }).click();
  await expect(options.getByText('Device key (no password)')).toBeVisible();

  await options.getByRole('button', { name: 'Add a master password' }).click();
  await options.getByLabel('New password', { exact: true }).fill(MASTER_PASSWORD);
  await options.getByLabel('Confirm new password').fill(MASTER_PASSWORD);
  await options.getByRole('button', { name: 'Set password' }).click();
  await expect(options.getByText(/Master password set/)).toBeVisible();

  await popup.reload();
  await popup.getByTitle('Lock now').click();
  await expect(popup.getByText('Enter your master password to unlock.')).toBeVisible();

  await popup.getByPlaceholder('Master password').fill('the wrong one');
  await popup.getByRole('button', { name: 'Unlock' }).click();
  await expect(popup.getByText('Wrong master password.')).toBeVisible();

  await popup.getByPlaceholder('Master password').fill(MASTER_PASSWORD);
  await popup.getByRole('button', { name: 'Unlock' }).click();
  await expect(popup.getByText('GitHub').first()).toBeVisible();
});

test('a Google Authenticator export brings every account across', async ({
  context,
  extensionId,
}) => {
  const page = await openPopup(context, extensionId);
  await createDeviceVault(page);

  await addAccount(
    page,
    migrationUri([
      { secret: SECRET, name: 'alice@example.com', issuer: 'Alpha' },
      { secret: 'MZXW6YTBOI', name: 'bob@example.com', issuer: 'Beta' },
    ]),
  );

  await expect(page.getByText('Alpha').first()).toBeVisible();
  await expect(page.getByText('Beta').first()).toBeVisible();
});

async function issueRecoveryKey(options: Page): Promise<string> {
  await options.getByRole('button', { name: 'Security', exact: true }).click();
  await options.getByRole('button', { name: /Create a recovery key|Issue a new one/ }).click();

  return saveRecoveryKey(options);
}

test('a recovery key opens a vault whose password was forgotten', async ({
  context,
  extensionId,
}) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  await addAccount(popup, SETUP_URI);

  const options = await openOptions(context, extensionId);
  await options.getByRole('button', { name: 'Security', exact: true }).click();
  await options.getByRole('button', { name: 'Add a master password' }).click();
  await options.getByLabel('New password', { exact: true }).fill(MASTER_PASSWORD);
  await options.getByLabel('Confirm new password').fill(MASTER_PASSWORD);
  await options.getByRole('button', { name: 'Set password' }).click();
  await expect(options.getByText(/Master password set/)).toBeVisible();

  const recoveryKey = await issueRecoveryKey(options);
  expect(recoveryKey).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){7}$/);

  await popup.reload();
  await popup.getByTitle('Lock now').click();
  await popup.getByRole('button', { name: /Use your recovery key/ }).click();

  // Retyped the way someone copying off paper would: lower case, own spacing.
  await popup.getByLabel('Recovery key').fill(recoveryKey.toLowerCase().replace(/-/g, ' '));
  await popup.getByLabel('New master password', { exact: true }).fill('a different password now');
  await popup.getByLabel('Confirm password', { exact: true }).fill('a different password now');
  await popup.getByRole('button', { name: /Unlock and re-lock/ }).click();

  await expect(popup.getByText('GitHub').first()).toBeVisible();

  // The old password is genuinely gone, and the new one works.
  await popup.getByTitle('Lock now').click();
  await popup.getByPlaceholder('Master password').fill(MASTER_PASSWORD);
  await popup.getByRole('button', { name: 'Unlock' }).click();
  await expect(popup.getByText('Wrong master password.')).toBeVisible();

  await popup.getByPlaceholder('Master password').fill('a different password now');
  await popup.getByRole('button', { name: 'Unlock' }).click();
  await expect(popup.getByText('GitHub').first()).toBeVisible();
});

test('a recovery key rescues a vault whose device key is gone', async ({
  context,
  extensionId,
  worker,
}) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  await addAccount(popup, SETUP_URI);

  const options = await openOptions(context, extensionId);
  const recoveryKey = await issueRecoveryKey(options);
  await options.close();

  // Destroy the browser-held key the way clearing site data would, then kill
  // the worker so its in-memory copy goes with it. This is the state the UI
  // calls unrecoverable, and the case the kit exists for.
  await popup.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase('authx-keys');
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => resolve();
      }),
  );

  const cdp = await context.newCDPSession(popup);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const swTarget = targetInfos.find((target) => target.type === 'service_worker');
  if (swTarget) await cdp.send('Target.closeTarget', { targetId: swTarget.targetId });
  await worker.waitForEvent('close', { timeout: 15_000 }).catch(() => undefined);

  await popup.reload();
  await expect(popup.getByText('This vault can no longer be opened')).toBeVisible();
  await expect(popup.getByText(/You issued a recovery key/)).toBeVisible();

  await popup.getByRole('button', { name: 'Use my recovery key' }).click();
  await popup.getByLabel('Recovery key').fill(recoveryKey);
  await popup.getByLabel('New master password', { exact: true }).fill(MASTER_PASSWORD);
  await popup.getByLabel('Confirm password', { exact: true }).fill(MASTER_PASSWORD);
  await popup.getByRole('button', { name: /Unlock and re-lock/ }).click();

  await expect(popup.getByText('GitHub').first()).toBeVisible();
  await expect(popup.locator('.code-digits')).toHaveCount(1);
});

test('without a kit, an unopenable vault says so rather than offering false hope', async ({
  context,
  extensionId,
  worker,
}) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  await addAccount(popup, SETUP_URI);

  await popup.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase('authx-keys');
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => resolve();
      }),
  );

  const cdp = await context.newCDPSession(popup);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const swTarget = targetInfos.find((target) => target.type === 'service_worker');
  if (swTarget) await cdp.send('Target.closeTarget', { targetId: swTarget.targetId });
  await worker.waitForEvent('close', { timeout: 15_000 }).catch(() => undefined);

  await popup.reload();
  await expect(popup.getByText('This vault can no longer be opened')).toBeVisible();
  await expect(popup.getByRole('button', { name: 'Use my recovery key' })).toHaveCount(0);
  await expect(popup.getByRole('button', { name: 'Start over' })).toBeVisible();
});

test('typing a service name suggests it, and taking the suggestion records its site', async ({
  context,
  extensionId,
  worker,
}) => {
  const page = await openPopup(context, extensionId);
  await createDeviceVault(page);

  await page.getByTitle('Add account').click();
  await page.getByRole('button', { name: /Enter a setup key manually/ }).click();

  const service = page.getByRole('combobox', { name: 'Service' });
  await service.fill('git');

  const options = page.getByRole('option');
  await expect(options.first()).toContainText('GitHub');
  // Ambiguous queries offer both rather than guessing.
  await expect(page.getByRole('option', { name: /GitLab/ })).toBeVisible();

  // Nothing is pre-selected. Someone typing an internal name like "Git server"
  // and pressing Enter to submit must not silently get GitHub instead.
  await expect(service).not.toHaveAttribute('aria-activedescendant', /./);

  // Keyboard, because this field is the one people tab into and type.
  await service.press('ArrowDown');
  await expect(service).toHaveAttribute('aria-activedescendant', /-option-github$/);
  await service.press('Enter');

  await expect(service).toHaveValue('GitHub');
  await expect(page.getByText(/github\.com will be offered/)).toBeVisible();
  await expect(options).toHaveCount(0);

  await page.getByRole('textbox', { name: 'Account', exact: true }).fill('octocat@example.com');
  await page.getByLabel('Setup key').fill(SECRET);
  await page.locator('form').getByRole('button', { name: 'Add account' }).click();
  await expect(page.getByText('GitHub').first()).toBeVisible();

  // The domain the suggestion carried is what makes autofill work later, so it
  // has to have been stored rather than just displayed.
  const stored = await worker.evaluate(async () => {
    const all = await chrome.storage.local.get('authx.vault');
    return Boolean(all['authx.vault']);
  });
  expect(stored).toBe(true);

  const domains = await page.evaluate(async () => {
    const response = (await chrome.runtime.sendMessage({ type: 'vault/status' })) as {
      value: { data: { items: { domains: string[] }[] } };
    };
    return response.value.data.items[0]!.domains;
  });
  expect(domains).toContain('github.com');
});

test('a name no service has still goes through as typed', async ({ context, extensionId }) => {
  const page = await openPopup(context, extensionId);
  await createDeviceVault(page);

  await page.getByTitle('Add account').click();
  await page.getByRole('button', { name: /Enter a setup key manually/ }).click();

  const service = page.getByRole('combobox', { name: 'Service' });
  await service.fill('Acme Internal VPN');
  await expect(page.getByRole('option')).toHaveCount(0);

  await page.getByLabel('Setup key').fill(SECRET);
  await page.locator('form').getByRole('button', { name: 'Add account' }).click();
  await expect(page.getByText('Acme Internal VPN').first()).toBeVisible();
});

// A valid 1x1 PNG. Small enough to inline, real enough for the decoder.
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

async function openEditor(options: Page, account: string) {
  await options.getByRole('button', { name: 'Accounts' }).click();
  await options
    .getByRole('listitem')
    .filter({ hasText: account })
    .getByRole('button', { name: 'Edit' })
    .first()
    .click();
}

test('a picture chosen for an account replaces its mark everywhere', async ({
  context,
  extensionId,
  worker,
}) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  await addAccount(popup, SETUP_URI);

  // Before: the bundled GitHub mark, drawn as an svg.
  await expect(popup.locator('li svg[viewBox]').first()).toBeVisible();
  await expect(popup.locator('li img')).toHaveCount(0);

  const options = await openOptions(context, extensionId);
  await openEditor(options, 'GitHub');
  await options.locator('input[type="file"]').setInputFiles({
    name: 'logo.png',
    mimeType: 'image/png',
    buffer: TINY_PNG,
  });

  // The editor previews it straight away, before anything is saved.
  await expect(options.getByRole('button', { name: 'Remove' })).toBeVisible();
  await options.getByRole('button', { name: 'Save changes' }).click();

  await popup.reload();
  const shown = popup.locator('li img').first();
  await expect(shown).toBeVisible();
  await expect(shown).toHaveAttribute('src', /^data:image\/(webp|png);base64,/);

  // Stored inside the encrypted payload like everything else.
  const raw = await worker.evaluate(async () =>
    JSON.stringify(await chrome.storage.local.get('authx.vault')),
  );
  expect(raw).not.toContain('data:image');
});

test('removing the picture brings the service mark back', async ({ context, extensionId }) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  await addAccount(popup, SETUP_URI);

  const options = await openOptions(context, extensionId);
  await openEditor(options, 'GitHub');
  await options.locator('input[type="file"]').setInputFiles({
    name: 'logo.png',
    mimeType: 'image/png',
    buffer: TINY_PNG,
  });
  await options.getByRole('button', { name: 'Save changes' }).click();

  await openEditor(options, 'GitHub');
  await options.getByRole('button', { name: 'Remove' }).click();
  await options.getByRole('button', { name: 'Save changes' }).click();

  await popup.reload();
  await expect(popup.locator('li img')).toHaveCount(0);
  await expect(popup.locator('li svg[viewBox]').first()).toBeVisible();
});

test('an SVG is refused rather than rasterised and trusted', async ({ context, extensionId }) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  await addAccount(popup, SETUP_URI);

  const options = await openOptions(context, extensionId);
  await openEditor(options, 'GitHub');

  // SVG can carry script and external references. Nothing here needs it, so it
  // never reaches the decoder in the first place.
  await options.locator('input[type="file"]').setInputFiles({
    name: 'evil.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>'),
  });

  await expect(options.getByText(/PNG, JPEG, WebP, GIF or BMP/)).toBeVisible();
  await expect(options.getByRole('button', { name: 'Remove' })).toHaveCount(0);
});

test('the policy blocks the extension from reaching anywhere it should not', async ({
  context,
  extensionId,
}) => {
  const page = await openPopup(context, extensionId);

  // connect-src is the difference between a bug and an exfiltration path.
  const blocked = await page.evaluate(async () => {
    try {
      await fetch('https://example.com/collect');
      return 'allowed';
    } catch (error) {
      return (error as Error).name;
    }
  });
  expect(blocked).not.toBe('allowed');

  // img-src is what keeps "no service logo is ever fetched" a property of the
  // browser rather than of everyone remembering.
  const imageBlocked = await page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        const img = new Image();
        img.onload = () => resolve('loaded');
        img.onerror = () => resolve('blocked');
        img.src = 'https://www.google.com/s2/favicons?domain=github.com';
        setTimeout(() => resolve('blocked'), 4000);
      }),
  );
  expect(imageBlocked).toBe('blocked');

  const policy = await page.evaluate(
    () => chrome.runtime.getManifest().content_security_policy?.extension_pages ?? '',
  );
  expect(policy).toContain("img-src 'self' data:");
  expect(policy).toContain("object-src 'none'");
  expect(policy).toContain("form-action 'none'");
});

test('two surfaces writing at once both survive', async ({ context, extensionId }) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  await addAccount(popup, SETUP_URI);

  const options = await openOptions(context, extensionId);

  // A popup and a settings tab, both open, both writing. No attacker involved —
  // the sync alarm firing mid-edit does the same thing.
  const [fromPopup, fromOptions] = await Promise.all([
    popup.evaluate(() =>
      chrome.runtime.sendMessage({
        type: 'vault/mutate',
        mutation: {
          op: 'items/add',
          items: [
            {
              id: 'from-popup',
              type: 'totp',
              issuer: 'Popup',
              label: 'me',
              secret: 'JBSWY3DPEHPK3PXP',
              algorithm: 'SHA1',
              digits: 6,
              period: 30,
              counter: 0,
              note: '',
              icon: null,
              groupId: null,
              favorite: false,
              domains: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
              deletedAt: null,
              rev: 1,
              syncedRev: 0,
            },
          ],
        },
      }),
    ),
    options.evaluate(() =>
      chrome.runtime.sendMessage({
        type: 'vault/mutate',
        mutation: {
          op: 'items/add',
          items: [
            {
              id: 'from-options',
              type: 'totp',
              issuer: 'Options',
              label: 'me',
              secret: 'JBSWY3DPEHPK3PXP',
              algorithm: 'SHA1',
              digits: 6,
              period: 30,
              counter: 0,
              note: '',
              icon: null,
              groupId: null,
              favorite: false,
              domains: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
              deletedAt: null,
              rev: 1,
              syncedRev: 0,
            },
          ],
        },
      }),
    ),
  ]);

  expect(fromPopup).toMatchObject({ ok: true });
  expect(fromOptions).toMatchObject({ ok: true });

  await popup.reload();
  await expect(popup.getByText('Popup').first()).toBeVisible();
  await expect(popup.getByText('Options').first()).toBeVisible();
  await expect(popup.getByText('GitHub').first()).toBeVisible();
});

test('two surfaces making the vault at once make one, and it outlives the worker', async ({
  context,
  extensionId,
  worker,
}) => {
  // "Just start" pressed in the popup and in the Settings tab a new install
  // opens, together. Each would make a device key of its own; only one stays.
  const popup = await openPopup(context, extensionId);
  const options = await openOptions(context, extensionId);
  const create = () =>
    chrome.runtime.sendMessage({ type: 'vault/create', protection: { mode: 'device' } });
  const results = await Promise.all([popup.evaluate(create), options.evaluate(create)]);

  expect(results.filter((result) => result.ok)).toHaveLength(1);
  expect(results.find((result) => !result.ok)).toMatchObject({ key: 'error.vaultExists' });

  await expect(popup.getByText('No accounts yet')).toBeVisible();
  await addAccount(popup, SETUP_URI);
  await expect(popup.getByText('GitHub').first()).toBeVisible();

  // The vault on disk has to open with the key the key store kept, not only
  // with the one this worker still holds in memory.
  await killWorker(context, popup, worker);
  const revived = await openPopup(context, extensionId);
  await expect(revived.getByText('GitHub').first()).toBeVisible();
});

test('erasing everything while a write is under way leaves nothing behind', async ({
  context,
  extensionId,
}) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);

  // A write still under way when the erase arrives: a new master password
  // being stretched, here, or a sync waiting on the server. It saves only at
  // the end, after the erase if the two are let side by side.
  const [write, reset] = await popup.evaluate((password) =>
    Promise.all([
      chrome.runtime.sendMessage({ type: 'vault/setProtection', next: { mode: 'passphrase', password } }),
      chrome.runtime.sendMessage({ type: 'vault/reset' }),
    ]),
    MASTER_PASSWORD,
  );
  expect(write).toMatchObject({ ok: true });
  expect(reset).toMatchObject({ ok: true });

  const status = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/status' }));
  expect(status).toMatchObject({ ok: true, value: { state: 'uninitialized' } });
});

test('a lock that lands while a write is under way stays locked', async ({ context, extensionId }) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  const set = await popup.evaluate(
    (password) =>
      chrome.runtime.sendMessage({ type: 'vault/setProtection', next: { mode: 'passphrase', password } }),
    MASTER_PASSWORD,
  );
  expect(set).toMatchObject({ ok: true });

  // "Lock now", or the auto-lock alarm, while the master password is being
  // changed — both old and new stretched — or a sync waits on the server.
  // The write finishes after the lock, and used to open the vault again.
  const NEW_PASSWORD = 'a different password now';
  const [write, locked] = await popup.evaluate(
    ([current, next]) =>
      Promise.all([
        chrome.runtime.sendMessage({
          type: 'vault/setProtection',
          currentPassword: current,
          next: { mode: 'passphrase', password: next },
        }),
        chrome.runtime.sendMessage({ type: 'vault/lock' }),
      ]),
    [MASTER_PASSWORD, NEW_PASSWORD],
  );
  expect(write).toMatchObject({ ok: true });
  expect(locked).toMatchObject({ ok: true });

  const status = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/status' }));
  expect(status).toMatchObject({ ok: true, value: { state: 'locked' } });

  // The write itself still landed: the vault opens with the new password.
  await popup.getByPlaceholder('Master password').fill(NEW_PASSWORD);
  await popup.getByRole('button', { name: 'Unlock' }).click();
  await expect(popup.getByText('No accounts yet')).toBeVisible();
});

/** A device vault given a master password and locked, ready for an unlock. */
async function lockWithPassword(popup: Page, { recoveryKit = false } = {}) {
  await createDeviceVault(popup);
  await addAccount(popup, SETUP_URI);
  const set = await popup.evaluate(
    (password) =>
      chrome.runtime.sendMessage({ type: 'vault/setProtection', next: { mode: 'passphrase', password } }),
    MASTER_PASSWORD,
  );
  expect(set).toMatchObject({ ok: true });
  if (recoveryKit) {
    // Before the lock: the worker issues a kit only for an open vault.
    const kit = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'vault/createRecoveryKit' }));
    expect(kit).toMatchObject({ ok: true });
  }
  await popup.getByTitle('Lock now').click();
  await expect(popup.getByText('Enter your master password to unlock.')).toBeVisible();
}

test('Settings opened before the vault exists follows the vault made in the popup', async ({
  context,
  extensionId,
}) => {
  // What a new install does: the welcome tab opens on the setup screen, and
  // the person makes the vault from the toolbar instead.
  const options = await openOptions(context, extensionId);
  await expect(options.getByRole('button', { name: /Just start/ })).toBeVisible();

  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);

  await expect(options.getByRole('button', { name: 'Sync', exact: true })).toBeVisible();
});

test('a locked Settings tab follows an unlock made in the popup', async ({ context, extensionId }) => {
  const popup = await openPopup(context, extensionId);
  await lockWithPassword(popup);

  const options = await openOptions(context, extensionId);
  await expect(options.getByText('Enter your master password to unlock.')).toBeVisible();

  await popup.getByPlaceholder('Master password').fill(MASTER_PASSWORD);
  await popup.getByRole('button', { name: 'Unlock' }).click();
  await expect(popup.getByText('GitHub').first()).toBeVisible();

  await expect(options.getByRole('button', { name: 'Sync', exact: true })).toBeVisible();
  await expect(options.getByText('GitHub').first()).toBeVisible();
});

test('a Settings tab left on the recovery form asks for the password at the next lock', async ({
  context,
  extensionId,
}) => {
  const popup = await openPopup(context, extensionId);
  await lockWithPassword(popup, { recoveryKit: true });

  const options = await openOptions(context, extensionId);
  await options.getByRole('button', { name: /Use your recovery key/ }).click();
  await expect(options.getByRole('heading', { name: 'Use your recovery key' })).toBeVisible();

  await popup.getByPlaceholder('Master password').fill(MASTER_PASSWORD);
  await popup.getByRole('button', { name: 'Unlock' }).click();
  await expect(options.getByRole('button', { name: 'Sync', exact: true })).toBeVisible();

  await popup.getByTitle('Lock now').click();
  await expect(options.getByText('Enter your master password to unlock.')).toBeVisible();
});

// The page that makes the vault hears it announced like every other, and may
// draw it before its own answer arrives. Where it was headed must survive that.
test('a vault made on the way to signing in opens the popup on signing in', async ({
  context,
  extensionId,
}) => {
  const popup = await openPopup(context, extensionId);
  await popup.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(popup.getByRole('dialog', { name: 'Sync your vault' })).toBeVisible();
});

test('a vault made on the way to signing in opens Settings on Sync', async ({ context, extensionId }) => {
  const options = await openOptions(context, extensionId);
  await options.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(options.getByRole('button', { name: 'Sync', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
});
