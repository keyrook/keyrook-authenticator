import type { Page } from '@playwright/test';
import {
  createDeviceVault,
  expect,
  openOptions,
  openPopup,
  platformAuthenticator,
  securityKeyAuthenticator,
  test,
} from './fixtures.js';

/**
 * Touch ID, Windows Hello and the like, stood in for by `platformAuthenticator`,
 * and a USB security key by `securityKeyAuthenticator`.
 */
const MASTER_PASSWORD = 'a genuinely long master password';

const COMPUTER = 'Fingerprint, face or PIN';
const KEY = 'Security key';
const COMPUTER_ON = /The vault also opens with this computer’s own check/;
const KEY_ON = /The vault also opens with your security key and its PIN on this computer/;

async function addMasterPassword(options: Page) {
  await options.getByRole('button', { name: 'Add a master password' }).click();
  await options.getByLabel('New password', { exact: true }).fill(MASTER_PASSWORD);
  await options.getByLabel('Confirm new password').fill(MASTER_PASSWORD);
  await options.getByRole('button', { name: 'Set password' }).click();
  await expect(options.getByText(/Master password set/)).toBeVisible();
}

/** Each way in is a row of its own, with its own "Turn on". */
const row = (options: Page, name: string) => options.getByRole('group', { name, exact: true });

async function turnOn(options: Page, name: string, password = MASTER_PASSWORD) {
  await row(options, name).getByRole('button', { name: 'Turn on', exact: true }).click();
  await options.bringToFront();
  await row(options, name).getByLabel('Master password').fill(password);
  await row(options, name).locator('form').getByRole('button', { name: 'Turn on' }).click();
}

test('the device’s own check opens a password vault, once the password turned it on', async ({ context, extensionId }) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);

  const options = await openOptions(context, extensionId);
  const passkeys = await platformAuthenticator(options);
  await options.getByRole('button', { name: 'Security', exact: true }).click();
  // A vault that asks for no password says what one would let it do, and
  // offers nothing to turn on yet.
  await expect(row(options, COMPUTER).getByText('Needs a master password')).toBeVisible();
  await expect(row(options, KEY).getByText('Needs a master password')).toBeVisible();
  await expect(options.getByRole('button', { name: 'Turn on', exact: true })).toHaveCount(0);

  await addMasterPassword(options);

  // The password first: a wrong one leaves no passkey on the device.
  await expect(options.getByText(COMPUTER)).toBeVisible();
  await turnOn(options, COMPUTER, 'not the password');
  await expect(options.getByText('Wrong master password.')).toBeVisible();
  expect(await passkeys()).toBe(0);

  await row(options, COMPUTER).getByLabel('Master password').fill(MASTER_PASSWORD);
  await row(options, COMPUTER).locator('form').getByRole('button', { name: 'Turn on' }).click();
  await expect(options.getByText(COMPUTER_ON)).toBeVisible();
  expect(await passkeys()).toBe(1);

  // Nothing on disk holds what the passkey answers, nor the password.
  const stored = await options.evaluate(async () => JSON.stringify(await chrome.storage.local.get(null)));
  expect(stored).toContain('platformUnlock');
  expect(stored).not.toContain(MASTER_PASSWORD);

  await popup.reload();
  await popup.getByTitle('Lock now').click();
  await options.reload();
  await expect(options.getByText('Enter your master password to unlock.')).toBeVisible();
  // Only what was turned on is offered.
  await expect(options.getByRole('button', { name: 'Unlock with security key' })).toHaveCount(0);
  await options.bringToFront();
  await options.getByRole('button', { name: 'Unlock with fingerprint, face or PIN' }).click();
  await options.getByRole('button', { name: 'Security', exact: true }).click();
  await expect(options.getByText(COMPUTER_ON)).toBeVisible();

  // Off takes the way in away, and asks nothing.
  await row(options, COMPUTER).getByRole('button', { name: 'Turn off', exact: true }).click();
  await expect(row(options, COMPUTER).getByRole('button', { name: 'Turn on', exact: true })).toBeVisible();
  await popup.reload();
  await popup.getByTitle('Lock now').click();
  await expect(popup.getByText('Enter your master password to unlock.')).toBeVisible();
  await expect(popup.getByRole('button', { name: 'Unlock with fingerprint, face or PIN' })).toHaveCount(0);
});

test('an authenticator that cannot hold a key is said so, and nothing is turned on', async ({ context, extensionId }) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  const options = await openOptions(context, extensionId);
  // Checks the person, like the Chrome profile's Touch ID on a Mac, but no PRF.
  await platformAuthenticator(options, { prf: false });
  await options.getByRole('button', { name: 'Security', exact: true }).click();
  await addMasterPassword(options);

  await turnOn(options, COMPUTER);
  await expect(options.getByText(/cannot hold a key, so it cannot open the vault/)).toBeVisible();
  await expect(options.getByText(COMPUTER_ON)).toHaveCount(0);

  await popup.reload();
  await popup.getByTitle('Lock now').click();
  await expect(popup.getByText('Enter your master password to unlock.')).toBeVisible();
  await expect(popup.getByRole('button', { name: 'Unlock with fingerprint, face or PIN' })).toHaveCount(0);
});

test('a security key opens the vault beside the computer’s own check, and each turns off alone', async ({
  context,
  extensionId,
}) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  const options = await openOptions(context, extensionId);
  const computer = await platformAuthenticator(options);
  const key = await securityKeyAuthenticator(options);
  await options.getByRole('button', { name: 'Security', exact: true }).click();
  await addMasterPassword(options);

  // The key's row is there whatever is plugged in: a key is known only by asking.
  await expect(row(options, KEY)).toBeVisible();
  await turnOn(options, KEY, 'not the password');
  await expect(options.getByText('Wrong master password.')).toBeVisible();
  expect(await key()).toHaveLength(0);

  // Each made where it was asked for: the key's passkey on the key, the
  // computer's on the computer.
  await row(options, KEY).getByLabel('Master password').fill(MASTER_PASSWORD);
  await row(options, KEY).locator('form').getByRole('button', { name: 'Turn on' }).click();
  await expect(options.getByText(KEY_ON)).toBeVisible();
  expect(await key()).toHaveLength(1);
  expect(await computer()).toBe(0);
  await expect(options.getByText(COMPUTER_ON)).toHaveCount(0);
  await turnOn(options, COMPUTER);
  await expect(options.getByText(COMPUTER_ON)).toBeVisible();
  await expect(options.getByText(KEY_ON)).toBeVisible();
  expect(await computer()).toBe(1);
  expect(await key()).toHaveLength(1);

  const stored = await options.evaluate(async () => JSON.stringify(await chrome.storage.local.get(null)));
  expect(stored).toContain('securityKeyUnlock');
  expect(stored).not.toContain(MASTER_PASSWORD);

  // Locked, both are offered, and the key's button asks the key.
  await popup.reload();
  await popup.getByTitle('Lock now').click();
  await expect(popup.getByRole('button', { name: 'Unlock with fingerprint, face or PIN' })).toBeVisible();
  await expect(popup.getByRole('button', { name: 'Unlock with security key' })).toBeVisible();
  await options.reload();
  const [before] = await key();
  await options.bringToFront();
  await options.getByRole('button', { name: 'Unlock with security key' }).click();
  await options.getByRole('button', { name: 'Security', exact: true }).click();
  await expect(options.getByText(KEY_ON)).toBeVisible();
  const [after] = await key();
  expect(after!.signCount).toBeGreaterThan(before!.signCount);

  // The computer's off leaves the key, which still opens the vault.
  await row(options, COMPUTER).getByRole('button', { name: 'Turn off', exact: true }).click();
  await expect(row(options, COMPUTER).getByRole('button', { name: 'Turn on', exact: true })).toBeVisible();
  await expect(options.getByText(KEY_ON)).toBeVisible();
  await popup.reload();
  await popup.getByTitle('Lock now').click();
  await expect(popup.getByRole('button', { name: 'Unlock with fingerprint, face or PIN' })).toHaveCount(0);
  await expect(popup.getByRole('button', { name: 'Unlock with security key' })).toBeVisible();
  await options.reload();
  await options.bringToFront();
  await options.getByRole('button', { name: 'Unlock with security key' }).click();
  await options.getByRole('button', { name: 'Security', exact: true }).click();

  // And the key's off asks nothing either.
  await row(options, KEY).getByRole('button', { name: 'Turn off', exact: true }).click();
  await expect(row(options, KEY).getByRole('button', { name: 'Turn on', exact: true })).toBeVisible();
  await popup.reload();
  await popup.getByTitle('Lock now').click();
  await expect(popup.getByText('Enter your master password to unlock.')).toBeVisible();
  await expect(popup.getByRole('button', { name: 'Unlock with security key' })).toHaveCount(0);
});

test('a security key that cannot hold a key is said so, and nothing is turned on', async ({ context, extensionId }) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  const options = await openOptions(context, extensionId);
  // A key that checks a PIN but has no hmac-secret, as keys made only for two-step sign-in.
  await securityKeyAuthenticator(options, { prf: false });
  await options.getByRole('button', { name: 'Security', exact: true }).click();
  await addMasterPassword(options);

  await turnOn(options, KEY);
  await expect(options.getByText(/This security key cannot hold a key, so it cannot open the vault/)).toBeVisible();
  await expect(options.getByText(KEY_ON)).toHaveCount(0);

  await popup.reload();
  await popup.getByTitle('Lock now').click();
  await expect(popup.getByText('Enter your master password to unlock.')).toBeVisible();
  await expect(popup.getByRole('button', { name: 'Unlock with security key' })).toHaveCount(0);
});
