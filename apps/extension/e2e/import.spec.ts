import { createCipheriv, pbkdf2Sync } from 'node:crypto';
import { resolve } from 'node:path';
import { base32Bytes, createDeviceVault, expect, openOptions, openPopup, test } from './fixtures.js';

/**
 * Moving in from another app, through Settings: the real exports Aegis keeps
 * for its own importers, chosen as a person would choose them.
 */
const FIXTURES = resolve(import.meta.dirname, '../../../packages/core/test/fixtures/foreign');

test('an Aegis export comes in whole, its Steam Guard code too', async ({ context, extensionId }) => {
  const options = await openOptions(context, extensionId);
  await createDeviceVault(options);
  await options.getByRole('button', { name: 'Backup', exact: true }).click();
  await options.getByRole('button', { name: 'Import', exact: true }).click();
  await expect(options.getByText(/Exports from Aegis, 2FAS, Bitwarden/)).toBeVisible();

  await options.locator('input[type="file"]').setInputFiles(resolve(FIXTURES, 'aegis_plain.json'));
  await expect(options.getByText('Found 7 new accounts.')).toBeVisible();
  await options.getByRole('button', { name: 'Import 7' }).click();

  await options.getByRole('button', { name: 'Accounts', exact: true }).click();
  for (const issuer of ['Deno', 'SPDX', 'Airbnb', 'Issuu', 'Air Canada', 'WWE', 'Boeing']) {
    await expect(options.getByText(issuer, { exact: true })).toBeVisible();
  }
  await expect(options.getByText(/Steam Guard · 30s/)).toBeVisible();

  // Five characters from Steam's alphabet, as Steam's own app shows them.
  const popup = await openPopup(context, extensionId);
  const row = popup.locator('li', { hasText: 'Boeing' });
  await expect(row.locator('.code-digits')).toHaveText(/^[23456789BCDFGHJKMNPQRTVWXY]{5}$/);
});

test('a locked 2FAS export asks for the password set in 2FAS, and a wrong one is said plainly', async ({
  context,
  extensionId,
}) => {
  const options = await openOptions(context, extensionId);
  await createDeviceVault(options);
  await options.getByRole('button', { name: 'Backup', exact: true }).click();
  await options.getByRole('button', { name: 'Import', exact: true }).click();

  await options.locator('input[type="file"]').setInputFiles(resolve(FIXTURES, '2fas_authenticator_encrypted_v4.2fas'));
  await expect(options.getByText('2FAS locked this export with a password. Enter the one you set there.')).toBeVisible();
  await options.getByLabel('Backup password').fill('not it');
  await options.getByRole('button', { name: 'Open backup' }).click();
  await expect(options.getByText('That password does not open this file.')).toBeVisible();

  await options.getByLabel('Backup password').fill('test');
  await options.getByRole('button', { name: 'Open backup' }).click();
  await expect(options.getByText('Found 5 new accounts.')).toBeVisible();
});

/**
 * Steam Desktop Authenticator's maFiles folder, encrypted with its passkey as
 * its FileEncryptor does it (core's foreign tests say how), chosen whole.
 */
function steamDesktopFolder(passkey: string) {
  const salt = Buffer.alloc(8, 9);
  const iv = Buffer.alloc(16, 1);
  const account = JSON.stringify({
    shared_secret: base32Bytes('63BEDWCQZKTQWPESARIERL5DTTQFCJTK').toString('base64'),
    account_name: 'gaben_test',
    revocation_code: 'R98765',
    identity_secret: 'aWRlbnRpdHktbm90LWtlcHQ=',
    Session: { SteamLoginSecure: 'session-not-kept' },
  });
  const cipher = createCipheriv('aes-256-cbc', pbkdf2Sync(passkey, salt, 50_000, 32, 'sha1'), iv);
  const sealed = Buffer.concat([cipher.update(account, 'utf8'), cipher.final()]).toString('base64');
  const manifest = {
    encrypted: true,
    first_run: false,
    entries: [
      { encryption_iv: iv.toString('base64'), encryption_salt: salt.toString('base64'), filename: '76561198000000001.maFile' },
    ],
  };
  return [
    { name: 'manifest.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(manifest)) },
    { name: '76561198000000001.maFile', mimeType: 'application/octet-stream', buffer: Buffer.from(sealed) },
  ];
}

test('Steam Desktop Authenticator’s encrypted maFiles open with its passkey, and keep only the code', async ({
  context,
  extensionId,
}) => {
  const options = await openOptions(context, extensionId);
  await createDeviceVault(options);
  await options.getByRole('button', { name: 'Backup', exact: true }).click();
  await options.getByRole('button', { name: 'Import', exact: true }).click();

  // The account's file alone cannot be opened: the manifest holds its salt.
  const [manifest, maFile] = steamDesktopFolder('correct horse');
  await options.locator('input[type="file"]').setInputFiles([maFile!]);
  await expect(options.getByText(/Choose every file in Steam Desktop Authenticator’s maFiles folder together/)).toBeVisible();

  await options.locator('input[type="file"]').setInputFiles([manifest!, maFile!]);
  await expect(
    options.getByText('Steam Desktop Authenticator locked this export with a password. Enter the one you set there.'),
  ).toBeVisible();
  await options.getByLabel('Backup password').fill('not it');
  await options.getByRole('button', { name: 'Open backup' }).click();
  await expect(options.getByText('That password does not open this file.')).toBeVisible();
  await options.getByLabel('Backup password').fill('correct horse');
  await options.getByRole('button', { name: 'Open backup' }).click();
  await expect(options.getByText('Found 1 new account.')).toBeVisible();
  await options.getByRole('button', { name: 'Import 1' }).click();

  await options.getByRole('button', { name: 'Accounts', exact: true }).click();
  await expect(options.getByText('gaben_test', { exact: false })).toBeVisible();
  await expect(options.getByText(/Steam Guard · 30s/)).toBeVisible();
  // The vault on disk is sealed anyway; this is about what was read at all:
  // the open vault holds the account, and nothing else from its file.
  const unlocked = await options.evaluate(async () =>
    JSON.stringify(((await chrome.runtime.sendMessage({ type: 'vault/status' })) as { value: { data: unknown } }).value.data),
  );
  expect(unlocked).toContain('gaben_test');
  for (const unread of ['R98765', 'aWRlbnRpdHk', 'session-not-kept']) expect(unlocked).not.toContain(unread);
});

test('a password manager’s CSV gives up its two-factor keys only, and says to delete the file', async ({
  context,
  extensionId,
}) => {
  const options = await openOptions(context, extensionId);
  await createDeviceVault(options);
  await options.getByRole('button', { name: 'Backup', exact: true }).click();
  await options.getByRole('button', { name: 'Import', exact: true }).click();

  const csv = [
    'Title,URL,Username,Password,Notes,OTPAuth',
    'github.com (octocat),https://github.com/login,octocat,hunter2-not-kept,,otpauth://totp/GitHub:octocat?secret=JBSWY3DPEHPK3PXP&issuer=GitHub',
    'bank.example (me),https://bank.example,me,another-password,,',
  ].join('\n');
  await options.locator('input[type="file"]').setInputFiles({
    name: 'Passwords.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv),
  });
  await expect(options.getByText(/This file holds your passwords in the clear/)).toBeVisible();
  await expect(options.getByText(/Found 1 new account/)).toBeVisible();
  await options.getByRole('button', { name: 'Import 1' }).click();

  // Nothing readable on disk holds the password from the same row.
  const stored = await options.evaluate(async () => JSON.stringify(await chrome.storage.local.get(null)));
  expect(stored).not.toContain('hunter2-not-kept');
  await options.getByRole('button', { name: 'Accounts', exact: true }).click();
  await expect(options.getByText('GitHub', { exact: true })).toBeVisible();
});
