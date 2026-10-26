import type { Page } from '@playwright/test';
import { createDeviceVault, expect, openOptions, openPopup, saveRecoveryKey, test } from './fixtures.js';

/**
 * What the interface shows, checked in a real browser.
 *
 * Each of these was found wrong in a screen-by-screen review before 0.1.1
 * went out, several of them already live in 0.1.0 and in its store listing.
 * A unit test cannot see a layout bug and a review only catches what someone
 * happens to look at, so the ones worth never seeing again are pinned here —
 * measured where the claim is about size, read where it is about words.
 */

const SECRET = 'JBSWY3DPEHPK3PXP';
const MASTER_PASSWORD = 'a real master password';

async function importLinks(options: Page, links: string[]) {
  await options.getByRole('button', { name: 'Backup', exact: true }).click();
  await options.getByRole('button', { name: 'Import', exact: true }).click();
  await options.getByLabel(/paste otpauth/).fill(links.join('\n'));
  await options.getByRole('button', { name: 'Read links' }).click();
  await options.getByRole('button', { name: `Import ${links.length}` }).click();
  await options.getByRole('button', { name: 'Accounts', exact: true }).click();
}

test('every switch keeps its knob inside the track, on the side that matches its state', async ({
  context,
  extensionId,
}) => {
  const options = await openOptions(context, extensionId);
  await createDeviceVault(options);
  await options.getByRole('button', { name: 'Security', exact: true }).click();

  const switches = options.getByRole('switch');
  await expect(switches.first()).toBeVisible();
  const count = await switches.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i += 1) {
    const toggle = switches.nth(i);
    for (const round of [0, 1]) {
      // Measured once as found and once flipped, so both states are checked
      // whatever each switch starts as. Wait out the slide before measuring.
      if (round === 1) await toggle.click();
      await options.waitForTimeout(250);

      const { track, knob, on } = await toggle.evaluate((element) => {
        const box = (target: Element) => target.getBoundingClientRect();
        return {
          track: box(element),
          knob: box(element.firstElementChild!),
          on: element.getAttribute('aria-checked') === 'true',
        };
      });
      const label = `${await toggle.getAttribute('aria-label')} (${on ? 'on' : 'off'})`;

      expect(knob.left, label).toBeGreaterThanOrEqual(track.left);
      expect(knob.right, label).toBeLessThanOrEqual(track.right);
      const middle = (knob.left + knob.right) / 2;
      const centre = (track.left + track.right) / 2;
      if (on) expect(middle, label).toBeGreaterThan(centre);
      else expect(middle, label).toBeLessThan(centre);
    }
  }
});

/**
 * Shipped in 0.1.0 and in store screenshot 5: "Up to 5 without signing in",
 * beside a vault holding more than five. The build enforces no cap. Six
 * accounts stored, and the page must not claim a limit they already exceed —
 * nor sell "no cap" as a reason to sign in.
 */
test('Account & sync claims no account limit the vault does not enforce', async ({
  context,
  extensionId,
}) => {
  const options = await openOptions(context, extensionId);
  await createDeviceVault(options);
  await importLinks(
    options,
    Array.from({ length: 6 }, (_, i) => `otpauth://totp/S${i}:u${i}@example.com?secret=${SECRET}&issuer=S${i}`),
  );
  await expect(options.getByText('6 accounts', { exact: true })).toBeVisible();

  await options.getByRole('button', { name: 'Sync', exact: true }).click();
  await expect(options.getByText('No limit', { exact: true })).toBeVisible();
  await expect(options.getByText(/Up to \d+ without signing in/)).toHaveCount(0);
  await expect(options.getByText(/No cap on how many accounts/)).toHaveCount(0);
  await expect(options.getByText(/paid vault/)).toHaveCount(0);
});

/**
 * The account editor's secret was once titled "Recovery key" — the name
 * Security gives the key that opens the whole vault. Someone looking for that
 * one could reveal this instead.
 */
test("an account's secret is called its setup key, never a recovery key", async ({
  context,
  extensionId,
}) => {
  const options = await openOptions(context, extensionId);
  await createDeviceVault(options);
  await importLinks(options, [`otpauth://totp/GitHub:me@example.com?secret=${SECRET}&issuer=GitHub`]);

  await options.getByRole('button', { name: 'Edit' }).first().click();
  const editor = options.getByRole('dialog');
  await expect(editor.getByText('Setup key', { exact: true })).toBeVisible();
  await expect(editor.getByText(/recovery key/i)).toHaveCount(0);
});

/**
 * The editor needs about 820px. In the add sheet's 560 it was cut off at
 * "Note", and macOS shows no scrollbar until something scrolls.
 */
test('the account editor shows every field without scrolling on an ordinary screen', async ({
  context,
  extensionId,
}) => {
  const options = await openOptions(context, extensionId);
  await options.setViewportSize({ width: 1280, height: 900 });
  await createDeviceVault(options);
  await importLinks(options, [`otpauth://totp/GitHub:me@example.com?secret=${SECRET}&issuer=GitHub`]);

  await options.getByRole('button', { name: 'Edit' }).first().click();
  const body = options.getByRole('dialog').locator('form > div');
  const { visible, content } = await body.evaluate((el) => ({
    visible: el.clientHeight,
    content: el.scrollHeight,
  }));
  expect(content).toBeLessThanOrEqual(visible);
});

/** Settings is itself the active tab; "scan this page" there photographed Settings. */
test('only the popup offers to scan the page it was opened over', async ({ context, extensionId }) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  await popup.getByTitle('Add account').click();
  await expect(popup.getByRole('button', { name: /Scan the QR code on this page/ })).toBeVisible();

  const options = await openOptions(context, extensionId);
  await options.getByRole('button', { name: 'Add account' }).first().click();
  const sheet = options.getByRole('dialog');
  await expect(sheet.getByRole('button', { name: /Scan with your camera/ })).toBeVisible();
  await expect(sheet.getByRole('button', { name: /Scan the QR code on this page/ })).toHaveCount(0);
});

/** It said 'the "secret" parameter is not valid base32'. */
test('a mistyped setup key is explained in words a person can act on', async ({ context, extensionId }) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  await popup.getByTitle('Add account').click();
  await popup.getByRole('button', { name: /Enter a setup key manually/ }).click();
  await popup.getByLabel('Setup key').fill('JBSWY3DPEH0K1PXP');
  await popup.locator('form').getByRole('button', { name: 'Add account' }).click();

  await expect(popup.getByText(/only the letters A–Z and the digits 2–7/)).toBeVisible();
  await expect(popup.getByText(/base32|parameter/i)).toHaveCount(0);
});

/**
 * A device-key vault has no password. Its recovery warning said "forgetting
 * your password", pointing its owner at a risk they do not have and away from
 * the one they do.
 */
test('the recovery warning names the risk for how the vault is actually locked', async ({
  context,
  extensionId,
}) => {
  const options = await openOptions(context, extensionId);
  await createDeviceVault(options);
  await options.getByRole('button', { name: 'Security', exact: true }).click();

  await expect(options.getByText(/losing the key this browser holds/)).toBeVisible();
  await expect(options.getByText(/forgetting your password/)).toHaveCount(0);

  await options.getByRole('button', { name: 'Add a master password' }).click();
  await options.getByLabel('New password', { exact: true }).fill(MASTER_PASSWORD);
  await options.getByLabel('Confirm new password').fill(MASTER_PASSWORD);
  await options.getByRole('button', { name: 'Set password' }).click();

  await expect(options.getByText(/forgetting your password/)).toBeVisible();
  await expect(options.getByText(/losing the key this browser holds/)).toHaveCount(0);
});

/** An emptied heading still printed its padding: a blank band above the list. */
test('the popup draws no empty headings over an ungrouped list', async ({ context, extensionId }) => {
  const options = await openOptions(context, extensionId);
  await createDeviceVault(options);
  await importLinks(options, [
    `otpauth://totp/GitHub:me@example.com?secret=${SECRET}&issuer=GitHub`,
    `otpauth://totp/Google:me@gmail.com?secret=MZXW6YTBOI&issuer=Google`,
  ]);

  const popup = await openPopup(context, extensionId);
  await expect(popup.getByText('GitHub').first()).toBeVisible();
  const headings = await popup.locator('h2').allInnerTexts();
  for (const heading of headings) expect(heading.trim()).not.toBe('');
});

/** Settings showed an issuer-less account's name as its title and again beneath it. */
test('an account with no service name is not named twice in Settings', async ({ context, extensionId }) => {
  const options = await openOptions(context, extensionId);
  await createDeviceVault(options);
  await importLinks(options, [`otpauth://totp/justalabel?secret=${SECRET}`]);

  const row = options.getByRole('listitem').filter({ hasText: 'justalabel' });
  const text = await row.innerText();
  expect(text.match(/justalabel/g)).toHaveLength(1);
});

/**
 * 39 characters with its dashes; at the old size the popup's field showed
 * about 35 of them, cutting the key off under the user's own typing.
 */
test('a whole recovery key fits in the recovery field', async ({ context, extensionId }) => {
  const options = await openOptions(context, extensionId);
  await createDeviceVault(options);
  await options.getByRole('button', { name: 'Security', exact: true }).click();
  await options.getByRole('button', { name: 'Add a master password' }).click();
  await options.getByLabel('New password', { exact: true }).fill(MASTER_PASSWORD);
  await options.getByLabel('Confirm new password').fill(MASTER_PASSWORD);
  await options.getByRole('button', { name: 'Set password' }).click();
  await options.getByRole('button', { name: /Create a recovery key/ }).click();
  const key = await saveRecoveryKey(options);

  const popup = await openPopup(context, extensionId);
  await popup.setViewportSize({ width: 380, height: 520 });
  await popup.getByTitle('Lock now').click();
  await popup.getByRole('button', { name: /Use your recovery key/ }).click();
  const field = popup.getByLabel('Recovery key');
  await field.fill(key);

  const { scroll, client } = await field.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(scroll).toBeLessThanOrEqual(client);
});

test('General lists both shortcuts as Chrome has them set, the fill one included', async ({ context, extensionId }) => {
  const options = await openOptions(context, extensionId);
  await createDeviceVault(options);
  await options.getByRole('button', { name: 'General', exact: true }).click();
  const fill = options.locator('div', { hasText: /^Fill the code for this page/ }).first();
  await expect(fill).toBeVisible();
  await expect(fill.getByText(/Fills only where exactly one account belongs to the site/)).toBeVisible();
  // Whatever keys Chrome assigned on install, shown as keys rather than left blank.
  const keys = await options.locator('kbd').allInnerTexts();
  expect(keys.join('+')).toContain('F');
});

test('a new recovery key is kept only once two of its groups are typed back from it', async ({ context, extensionId }) => {
  const options = await openOptions(context, extensionId);
  await createDeviceVault(options);
  await options.getByRole('button', { name: 'Security', exact: true }).click();
  await options.getByRole('button', { name: /Create a recovery key/ }).click();
  const key = (await options.locator('code.code-digits').innerText()).replace(/\s/g, '');

  // A checkbox let people go on with a key they never kept. Groups that are
  // not the key's are refused — U is not in a key's alphabet, so never one —
  // and the key can still be shown again and saved now.
  await options.getByRole('button', { name: 'I have saved it' }).click();
  for (const field of await options.locator('input[data-group]').all()) await field.fill('UUUU');
  await options.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(options.getByText(/That is not what your key says/)).toBeVisible();
  await expect(options.getByText('A recovery key has been issued')).toHaveCount(0);
  await options.getByRole('button', { name: 'Show the key again' }).click();
  expect((await options.locator('code.code-digits').innerText()).replace(/\s/g, '')).toBe(key);

  // The right groups, typed the way a person copies them, let it go.
  await options.getByRole('button', { name: 'I have saved it' }).click();
  const groups = key.split('-');
  for (const field of await options.locator('input[data-group]').all()) {
    await field.fill(groups[Number(await field.getAttribute('data-group')) - 1]!.toLowerCase());
  }
  await options.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(options.getByText('A recovery key has been issued')).toBeVisible();
});
