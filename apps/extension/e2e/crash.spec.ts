import type { Page } from '@playwright/test';
import {
  allowBreakingRender,
  breakRendering,
  createDeviceVault,
  expect,
  openOptions,
  openPopup,
  RENDER_FAULT,
  test,
} from './fixtures.js';

/**
 * A screen that throws while drawing. In 0.4.0 an account with an empty secret
 * made "Share or move" throw, and React unmounted everything: a white popup
 * with nothing to press. These make a screen throw on purpose and check that
 * what is left says so, and that its one button brings the page back.
 */

/** Collects what the page logs as an error: React reports what it caught there. */
function errorsOf(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function expectWayBack(page: Page, errors: string[]) {
  // The fault is the one this test planted, not some other failure that
  // happens to land on the same screen.
  await expect.poll(() => errors.some((error) => error.includes(RENDER_FAULT))).toBe(true);

  const alert = page.getByRole('alert');
  await expect(alert.getByRole('heading', { name: 'Something went wrong' })).toBeVisible();
  await expect(alert.getByText('Your saved accounts are not affected.')).toBeVisible();
  // What React leaves when nothing catches the error: an empty #root.
  await expect(page.locator('#root')).not.toBeEmpty();
  expect((await page.locator('body').innerText()).trim()).not.toBe('');

  // With the fault gone, the button is a real reload into a working page.
  await breakRendering(page, false);
  await Promise.all([
    page.waitForEvent('load'),
    alert.getByRole('button', { name: 'Reload' }).click(),
  ]);
  await expect(page.getByText('Something went wrong')).toHaveCount(0);
}

test('the popup shows a way back when a screen throws while drawing', async ({ context, extensionId }) => {
  await allowBreakingRender(context);
  const popup = await openPopup(context, extensionId);
  await createDeviceVault(popup);
  const errors = errorsOf(popup);

  await breakRendering(popup);
  await popup.reload();

  await expectWayBack(popup, errors);
  await expect(popup.getByText('No accounts yet')).toBeVisible();
});

test('Settings shows a way back when a screen throws while drawing', async ({ context, extensionId }) => {
  await allowBreakingRender(context);
  const options = await openOptions(context, extensionId);
  await createDeviceVault(options);
  const errors = errorsOf(options);

  await breakRendering(options);
  await options.reload();

  await expectWayBack(options, errors);
  await expect(options.getByRole('button', { name: 'Accounts', exact: true })).toBeVisible();
});
