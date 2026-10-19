import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { formatCode, generateTotp, shareCodes, shareLink } from '@authx/core';

/**
 * The page a shared link opens — keyrook.com/authenticator/share/ — in a real
 * browser, as production serves it. What it promises is tried by breaking it:
 * the codes stop when the link ends, nothing leaves the page, and a name sent
 * with the link stays text.
 */
const PAGE = readFileSync(resolve(import.meta.dirname, '../../../site/keyrook.com/authenticator/share/index.html'), 'utf8');
const URL_ = 'https://keyrook.test/authenticator/share/';
const SECRET = 'JBSWY3DPEHPK3PXP';
/** 12:00:10 UTC, ten seconds into a step. */
const MADE = Date.UTC(2026, 9, 17, 12, 0, 10);
const ITEM = { type: 'totp' as const, secret: SECRET, algorithm: 'SHA1' as const, digits: 6, period: 30, issuer: 'GitHub', label: 'me@example.com' };

async function open(page: Page, link: string, at: number, reached: string[] = []) {
  await page.context().route('**/*', (route) => {
    reached.push(route.request().url());
    return route.request().url() === URL_ ? route.fulfill({ contentType: 'text/html', body: PAGE }) : route.abort();
  });
  await page.clock.install({ time: at });
  await page.goto(`${URL_}${link.slice(link.indexOf('#'))}`);
}

const shown = (page: Page) => page.getByRole('button', { name: 'Current code' });

test('shows the code the app would, while the link lasts', async ({ page }) => {
  const reached: string[] = [];
  await open(page, shareLink(await shareCodes(ITEM, 15, MADE)), MADE + 4 * 60_000, reached);
  await expect(shown(page)).toHaveText(formatCode(await generateTotp(SECRET, {}, MADE + 4 * 60_000)));
  await expect(page.getByText('GitHub · me@example.com')).toBeVisible();
  // The codes came with the address, after the #: nothing else was fetched.
  expect(reached).toEqual([URL_]);
});

test('ends when its time is up, and drops the codes from the address', async ({ page }) => {
  await open(page, shareLink(await shareCodes(ITEM, 5, MADE)), MADE + 4 * 60_000);
  await expect(shown(page)).toBeVisible();
  await page.clock.runFor(2 * 60_000);
  await expect(page.getByText(/This link has ended/)).toBeVisible();
  await expect(shown(page)).toBeHidden();
  expect(new URL(page.url()).hash).toBe('');
});

test('opened long after, shows nothing but that it has ended', async ({ page }) => {
  await open(page, shareLink(await shareCodes(ITEM, 60, MADE)), MADE + 24 * 60 * 60_000);
  await expect(page.getByText(/This link has ended/)).toBeVisible();
  await expect(shown(page)).toBeHidden();
});

test('a damaged link is said to be one', async ({ page }) => {
  await open(page, `${URL_}#bm90IGEgbGluaw`, MADE);
  await expect(page.getByRole('status')).toHaveText('This link is damaged.');
});

test('a name sent with the link stays text, and no other script runs', async ({ page }) => {
  const hostile = shareLink(await shareCodes({ ...ITEM, issuer: '<img src=x onerror="window.__ran=1">' }, 5, MADE));
  await open(page, hostile, MADE);
  await expect(page.getByText('<img src=x onerror="window.__ran=1"> · me@example.com')).toBeVisible();
  expect(await page.locator('img').count()).toBe(0);
  const injected = await page.evaluate(() => {
    const script = document.createElement('script');
    script.textContent = 'window.__injected = true';
    document.body.append(script);
    return (window as unknown as { __injected?: boolean; __ran?: number }).__injected ?? false;
  });
  expect(injected).toBe(false);
});
