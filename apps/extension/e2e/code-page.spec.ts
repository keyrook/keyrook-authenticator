import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { formatCode, generateTotp } from '@authx/core';

/**
 * The website's code page — keyrook.com/authenticator/code/ — in a real
 * browser, served over HTTPS as it is in production. Its claims are tested by
 * trying to break them: a key typed in must not leave the page, and a script
 * slipped into it must not run.
 */
const PAGE = readFileSync(resolve(import.meta.dirname, '../../../site/keyrook.com/authenticator/code/index.html'), 'utf8');
const URL_ = 'https://keyrook.test/authenticator/code/';
// RFC 6238's test key: at T = 59 s it makes 94287082, or 287082 in six digits.
const RFC_KEY = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

/**
 * `reached` is what got past the browser to the network — the routing sees a
 * request only then. Chromium still reports a request its policy blocked, as
 * a failure for "csp"; those go in `refused`.
 */
async function open(page: Page, reached: string[] = [], refused: string[] = []) {
  await page.context().route('**/*', (route) => {
    reached.push(route.request().url());
    return route.request().url() === URL_
      ? route.fulfill({ contentType: 'text/html', body: PAGE })
      : route.abort();
  });
  page.on('requestfailed', (request) => {
    if (request.failure()?.errorText === 'csp') refused.push(request.url());
  });
  await page.clock.setFixedTime(new Date(59_000));
  await page.goto(URL_);
}

test('a pasted key gives the code every correct implementation gives', async ({ page }) => {
  await open(page);
  await page.getByLabel('Setup key or otpauth:// link').fill('gezd gnbv gy3t qojq gezd gnbv gy3t qojq');
  await expect(page.getByRole('button', { name: 'Current code' })).toHaveText('287 082');

  await page.getByRole('button', { name: 'change' }).click();
  await page.getByLabel('Digits').selectOption('8');
  await expect(page.getByRole('button', { name: 'Current code' })).toHaveText('9428 7082');
});

test('a setup link brings its own settings and says whose it is', async ({ page }) => {
  await open(page);
  await page
    .getByLabel('Setup key or otpauth:// link')
    .fill(`otpauth://totp/Test:me%40example.com?secret=${RFC_KEY}&issuer=Test&digits=8`);
  await expect(page.getByRole('button', { name: 'Current code' })).toHaveText('9428 7082');
  await expect(page.getByText('Test · me@example.com')).toBeVisible();
  await expect(page.getByRole('button', { name: 'change' })).toBeHidden();
});

test('a mistyped key is explained, not turned into a wrong code', async ({ page }) => {
  await open(page);
  await page.getByLabel('Setup key or otpauth:// link').fill('JBSW Y3DP 0000');
  await expect(page.getByRole('alert')).toContainText('letters A–Z and the digits 2–7');
  await expect(page.getByRole('button', { name: 'Current code' })).toBeHidden();
});

test('the key cannot leave the page, and no other script can run in it', async ({ page }) => {
  const reached: string[] = [];
  const refused: string[] = [];
  await open(page, reached, refused);
  await page.getByLabel('Setup key or otpauth:// link').fill(RFC_KEY);
  await expect(page.getByRole('button', { name: 'Current code' })).toHaveText('287 082');

  // Asked to, the page refuses to connect anywhere — its own policy, enforced
  // by the browser, not by the routing above.
  const attempts = await page.evaluate(async (key) => {
    const tried = async (attempt: () => Promise<unknown>) => attempt().then(() => 'sent', () => 'blocked');
    return {
      fetch: await tried(() => fetch(`https://keyrook.test/?k=${key}`)),
      image: await tried(
        () =>
          new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = resolve;
            image.onerror = reject;
            image.src = `https://keyrook.test/pixel?k=${key}`;
          }),
      ),
    };
  }, RFC_KEY);
  expect(attempts).toEqual({ fetch: 'blocked', image: 'blocked' });

  // A script injected the way a proxy in front of the site could inject one.
  const ran = await page.evaluate(() => {
    const script = document.createElement('script');
    script.textContent = 'window.__injected = true';
    document.body.append(script);
    return (window as unknown as { __injected?: boolean }).__injected ?? false;
  });
  expect(ran).toBe(false);

  // The page itself was the only thing that ever reached the network; the
  // image was stopped by the policy, not by the routing.
  expect(reached).toEqual([URL_]);
  expect(refused).toEqual([`https://keyrook.test/pixel?k=${RFC_KEY}`]);
});

/**
 * The other pages hold to the same rule: their own script, if any, and no
 * other, so nothing injected into a page on its way to the browser runs.
 */
async function serve(page: Page, file: string, url: string) {
  const html = readFileSync(resolve(import.meta.dirname, '../../../site/keyrook.com/authenticator', file), 'utf8');
  await page.context().route('**/*', (route) =>
    route.request().url() === url ? route.fulfill({ contentType: 'text/html', body: html }) : route.abort(),
  );
  await page.clock.setFixedTime(new Date(59_000));
  await page.goto(url);
}

const injected = (page: Page) =>
  page.evaluate(() => {
    const script = document.createElement('script');
    script.textContent = 'window.__injected = true';
    document.body.append(script);
    return (window as unknown as { __injected?: boolean }).__injected ?? false;
  });

test('the intro page runs its own script and no other', async ({ page }) => {
  await serve(page, 'index.html', 'https://keyrook.test/authenticator/');
  // Its sample codes are live, so its script ran under the policy's hash.
  const expected = formatCode(await generateTotp('JBSWY3DPEHPK3PXP', {}, 59_000));
  await expect(page.locator('[data-secret="JBSWY3DPEHPK3PXP"] .code')).toHaveText(expected);
  expect(await injected(page)).toBe(false);
});

test('the privacy page runs no script at all', async ({ page }) => {
  await serve(page, 'privacy/index.html', 'https://keyrook.test/authenticator/privacy/');
  await expect(page.getByRole('heading', { name: /Privacy Policy/ })).toBeVisible();
  expect(await injected(page)).toBe(false);
});
