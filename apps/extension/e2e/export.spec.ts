import { readFileSync } from 'node:fs';
import type { Locator, Page } from '@playwright/test';
import jsQR from 'jsqr';
import { generateHotp, parseMigrationUri, readSharedCodes } from '@authx/core';
import { createDeviceVault, expect, openOptions, openPopup, test } from './fixtures.js';

/**
 * Getting accounts out, to another app or to paper, in a real browser.
 *
 * Every QR code drawn here is read back the way a phone would read it — the
 * page's own SVG, rasterised and decoded — so a code that looks right but
 * says the wrong thing fails, not just a missing one.
 */

const SECRET = 'JBSWY3DPEHPK3PXP';
const MASTER_PASSWORD = 'a real master password';
const SERVICES = ['GitHub', 'Gmail', 'Dropbox', 'Slack', 'Figma', 'Notion', 'Stripe', 'Linear', 'Vercel'];

const link = (issuer: string) =>
  `otpauth://totp/${encodeURIComponent(issuer)}:me%40example.com?secret=${SECRET}&issuer=${encodeURIComponent(issuer)}`;

async function importLinks(options: Page, links: string[]) {
  await options.getByRole('button', { name: 'Backup', exact: true }).click();
  await options.getByRole('button', { name: 'Import', exact: true }).click();
  await options.getByLabel(/paste otpauth/).fill(links.join('\n'));
  await options.getByRole('button', { name: 'Read links' }).click();
  await options.getByRole('button', { name: `Import ${links.length}` }).click();
  await expect(options.getByLabel(/paste otpauth/)).toHaveValue('');
}

/** Read a QR code off the page as a camera would: from its pixels. */
async function readQr(svg: Locator): Promise<string> {
  const { d, modules } = await svg.evaluate((element) => ({
    d: element.querySelector('path')!.getAttribute('d')!,
    modules: Number(element.getAttribute('viewBox')!.split(' ')[2]),
  }));
  const scale = 4;
  const size = modules * scale;
  const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
  for (const [, x, y] of d.matchAll(/M(\d+) (\d+)/g)) {
    for (let dy = 0; dy < scale; dy++) {
      for (let dx = 0; dx < scale; dx++) {
        const at = ((Number(y) * scale + dy) * size + Number(x) * scale + dx) * 4;
        pixels[at] = pixels[at + 1] = pixels[at + 2] = 0;
      }
    }
  }
  const decoded = jsQR(pixels, size, size);
  if (!decoded) throw new Error('The QR code on the page does not read.');
  return decoded.data;
}

/** Backup → Move to another app: where every readable export is. */
async function openMove(options: Page) {
  await options.getByRole('button', { name: 'Backup', exact: true }).click();
  await options.getByRole('button', { name: 'Move to another app', exact: true }).click();
}

async function addMasterPassword(options: Page) {
  await options.getByRole('button', { name: 'Security', exact: true }).click();
  await options.getByRole('button', { name: 'Add a master password' }).click();
  await options.getByLabel('New password', { exact: true }).fill(MASTER_PASSWORD);
  await options.getByLabel('Confirm new password').fill(MASTER_PASSWORD);
  await options.getByRole('button', { name: 'Set password' }).click();
  await expect(options.getByText(/Master password set/)).toBeVisible();
}

test('one account moves to another app from the popup or Settings, by a code that scans', async ({
  context,
  extensionId,
}) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  const options = await openOptions(context, extensionId);
  await importLinks(options, [link('GitHub')]);

  await popup.reload();
  await popup.getByText('GitHub').first().hover();
  await popup.getByRole('button', { name: 'Share or move' }).click();
  await popup.getByRole('radio', { name: 'Move to another app' }).click();

  // Nothing secret is drawn until asked for, and the warning comes first.
  await expect(popup.getByRole('img', { name: /Setup QR code/ })).toHaveCount(0);
  await expect(popup.getByText(/Anyone who sees or photographs this code/)).toBeVisible();
  await popup.getByRole('button', { name: 'Show QR code' }).click();

  const code = popup.getByRole('img', { name: 'Setup QR code for GitHub' });
  const scanned = new URL(await readQr(code));
  expect(scanned.protocol).toBe('otpauth:');
  expect(scanned.searchParams.get('secret')).toBe(SECRET);
  expect(scanned.searchParams.get('issuer')).toBe('GitHub');

  await popup.getByRole('button', { name: 'Hide now' }).click();
  await expect(code).toHaveCount(0);

  // The same from the account list in Settings.
  await options.getByRole('button', { name: 'Accounts', exact: true }).click();
  await options.getByRole('button', { name: 'Share or move GitHub' }).click();
  await options.getByRole('radio', { name: 'Move to another app' }).click();
  await options.getByRole('button', { name: 'Show QR code' }).click();
  const again = new URL(await readQr(options.getByRole('img', { name: 'Setup QR code for GitHub' })));
  expect(again.searchParams.get('secret')).toBe(SECRET);
});

test('an account with no setup key says so where it would be shared or moved, and no page goes blank', async ({
  context,
  extensionId,
}) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  const options = await openOptions(context, extensionId);
  await importLinks(options, [link('GitHub')]);

  // What a build before 0.4 made of the deletion of an account a browser
  // never had, once someone pressed Restore: no key, no name. Its setup QR
  // code threw as it drew, and the page went blank.
  const empty = {
    id: 'empty-entry', type: 'totp', issuer: '', label: '', secret: '', algorithm: 'SHA1', digits: 6, period: 30,
    counter: 0, note: '', icon: null, groupId: null, favorite: false, domains: [], createdAt: Date.now(),
    updatedAt: Date.now(), deletedAt: null, rev: 1, syncedRev: 0,
  };
  await options.evaluate(
    (item) => chrome.runtime.sendMessage({ type: 'vault/mutate', mutation: { op: 'items/add', items: [item] } }),
    empty,
  );

  await popup.reload();
  const row = popup.locator('li', { hasText: 'Untitled' });
  await row.hover();
  await row.getByRole('button', { name: 'Share or move' }).click();
  await expect(popup.getByText(/This account has no setup key/)).toBeVisible();
  await expect(popup.getByRole('radio', { name: 'Move to another app' })).toHaveCount(0);
  await popup.getByRole('button', { name: 'Back' }).click();
  await expect(popup.getByText('GitHub').first()).toBeVisible();

  await options.getByRole('button', { name: 'Accounts', exact: true }).click();
  await options.getByRole('button', { name: 'Share or move Untitled' }).click();
  await expect(options.getByText(/This account has no setup key/)).toBeVisible();
  await options.getByRole('button', { name: 'Close' }).click();

  // Nothing to take to another app, so it is not offered; the rest still is.
  await openMove(options);
  await expect(options.getByText('All 1 account.')).toBeVisible();

  // Deleted, it is not offered back either: there is nothing in it.
  await options.evaluate(() =>
    chrome.runtime.sendMessage({ type: 'vault/mutate', mutation: { op: 'items/delete', id: 'empty-entry' } }),
  );
  await options.getByRole('button', { name: 'Accounts', exact: true }).click();
  await expect(options.getByText('GitHub').first()).toBeVisible();
  await expect(options.getByText('Recently deleted')).toHaveCount(0);
});

test('a link of codes for a while carries the codes the account makes, and not its key', async ({
  context,
  extensionId,
}) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  const options = await openOptions(context, extensionId);
  await importLinks(options, [link('GitHub')]);

  await popup.reload();
  // What the button puts on the clipboard, kept where the test can read it.
  await popup.evaluate(() => {
    navigator.clipboard.writeText = async (text: string) => {
      (window as unknown as { copied: string }).copied = text;
    };
  });
  await popup.getByText('GitHub').first().hover();
  await popup.getByRole('button', { name: 'Share or move' }).click();
  // A time-based account opens on the codes, the way that ends.
  await expect(popup.getByRole('radio', { name: 'Send codes' })).toHaveAttribute('aria-checked', 'true');
  await popup.getByRole('radio', { name: '5 minutes', exact: true }).click();
  await popup.getByRole('button', { name: 'Copy link' }).click();
  await expect(popup.getByRole('status')).toContainText('Link copied. It works until');

  const copied = await popup.evaluate(() => (window as unknown as { copied: string }).copied);
  expect(copied.startsWith('https://keyrook.com/authenticator/share/#')).toBe(true);
  expect(copied).not.toContain(SECRET);
  const shared = readSharedCodes(new URL(copied).hash);
  expect(shared.issuer).toBe('GitHub');
  expect(shared.codes.length).toBeGreaterThanOrEqual(10);
  for (const [index, code] of shared.codes.entries()) {
    expect(code).toBe(await generateHotp(SECRET, shared.start + index));
  }
});

test('readable exports ask for the master password, and are what they say', async ({
  context,
  extensionId,
}) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  const options = await openOptions(context, extensionId);
  await importLinks(options, SERVICES.map(link));
  await addMasterPassword(options);
  await openMove(options);

  // The gate: the box, then the password — an unlocked vault is not enough.
  const go = options.getByRole('button', { name: 'Continue' });
  await expect(go).toBeDisabled();
  await options.getByLabel('I understand these are not encrypted.').check();
  await expect(go).toBeDisabled();
  await options.getByLabel('Master password').fill('the wrong one');
  await go.click();
  await expect(options.getByText('Wrong master password.')).toBeVisible();
  await expect(options.getByRole('radio', { name: 'Google Authenticator' })).toHaveCount(0);

  await options.getByLabel('Master password').fill(MASTER_PASSWORD);
  await go.click();

  // Google Authenticator: nine accounts, two codes of one transfer, all nine in them.
  await options.getByRole('radio', { name: 'Google Authenticator' }).click();
  await expect(options.getByText('All at once')).toBeVisible();
  await options.getByRole('button', { name: 'Show transfer codes' }).click();
  await expect(options.getByText('Code 1 of 2')).toBeVisible();
  const first = parseMigrationUri(await readQr(options.getByRole('img', { name: 'Transfer code 1 of 2' })));
  await options.getByRole('button', { name: 'Next' }).click();
  const second = parseMigrationUri(await readQr(options.getByRole('img', { name: 'Transfer code 2 of 2' })));
  expect([first.batchIndex, second.batchIndex]).toEqual([0, 1]);
  expect(second.batchId).toBe(first.batchId);
  expect([...first.items, ...second.items].map((item) => item.issuer).sort()).toEqual([...SERVICES].sort());
  await options.getByRole('button', { name: 'Done' }).click();

  // The printable sheet: one code per account, each the account it names.
  await options.getByRole('button', { name: 'Print sheet' }).click();
  const codes = options.getByRole('img', { name: /^Setup QR code for / });
  await expect(codes).toHaveCount(SERVICES.length);
  const slack = new URL(await readQr(options.getByRole('img', { name: 'Setup QR code for Slack' })));
  expect(slack.searchParams.get('issuer')).toBe('Slack');
  await options.keyboard.press('Escape');
  await expect(codes).toHaveCount(0);

  // Aegis, for a chosen few.
  await options.getByRole('button', { name: 'Choose…' }).click();
  await options.getByRole('button', { name: 'None', exact: true }).click();
  await options.getByRole('checkbox', { name: /^Gmail/ }).check();
  await options.getByRole('checkbox', { name: /^Stripe/ }).check();
  await expect(options.getByText('2 of 9 chosen.')).toBeVisible();

  const download = options.waitForEvent('download');
  await options.getByRole('button', { name: 'Aegis .json' }).click();
  const file = await (await download).path();
  const aegis = JSON.parse(readFileSync(file, 'utf8'));
  expect(aegis.header.slots).toBeNull();
  expect(aegis.db.entries.map((entry: { issuer: string }) => entry.issuer).sort()).toEqual(['Gmail', 'Stripe']);
  expect(aegis.db.entries[0].info.secret).toBe(SECRET);
});

test('with no master password, the readable exports still need the box ticked', async ({
  context,
  extensionId,
}) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  const options = await openOptions(context, extensionId);
  await importLinks(options, [link('GitHub')]);

  await openMove(options);
  await expect(options.getByLabel('Master password')).toHaveCount(0);
  const go = options.getByRole('button', { name: 'Continue' });
  await expect(go).toBeDisabled();
  await options.getByLabel('I understand these are not encrypted.').check();
  await go.click();
  await expect(options.getByRole('button', { name: 'otpauth .txt' })).toBeVisible();
});

test('to an app with no import, the accounts come one after another, each one scannable', async ({
  context,
  extensionId,
}) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  const options = await openOptions(context, extensionId);
  const three = SERVICES.slice(0, 3);
  await importLinks(options, three.map(link));
  await openMove(options);
  await options.getByLabel('I understand these are not encrypted.').check();
  await options.getByRole('button', { name: 'Continue' }).click();

  await options.getByRole('radio', { name: 'Microsoft Authenticator' }).click();
  await expect(options.getByText('One at a time')).toBeVisible();
  await options.getByRole('button', { name: 'Scan one by one (3)' }).click();

  // Every account, in order, by button and by keyboard — and each code is that account's.
  const seen: string[] = [];
  for (let i = 0; i < three.length; i++) {
    await expect(options.getByText(`Account ${i + 1} of 3`)).toBeVisible();
    const code = options.getByRole('img', { name: /^Setup QR code for / });
    seen.push(new URL(await readQr(code)).searchParams.get('issuer')!);
    if (i === 0) await options.getByRole('button', { name: 'Next' }).click();
    else if (i === 1) await options.keyboard.press('ArrowRight');
  }
  expect(seen).toEqual(three);
  await options.getByRole('button', { name: 'Done' }).click();
  await expect(options.getByRole('img', { name: /^Setup QR code for / })).toHaveCount(0);
});

test('to Bitwarden, one file carries every account', async ({ context, extensionId }) => {
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  const options = await openOptions(context, extensionId);
  await importLinks(options, SERVICES.map(link));
  await openMove(options);
  await options.getByLabel('I understand these are not encrypted.').check();
  await options.getByRole('button', { name: 'Continue' }).click();

  await options.getByRole('radio', { name: 'Bitwarden' }).click();
  const download = options.waitForEvent('download');
  await options.getByRole('button', { name: 'Download Bitwarden file' }).click();
  const file = JSON.parse(readFileSync(await (await download).path(), 'utf8'));
  expect(file.encrypted).toBe(false);
  expect(file.items.map((entry: { name: string }) => entry.name).sort()).toEqual([...SERVICES].sort());
  expect(new URL(file.items[0].login.totp).searchParams.get('secret')).toBe(SECRET);
});
