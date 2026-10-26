import { test as base, chromium, type BrowserContext, type Page, type Worker } from '@playwright/test';
import {
  consoleStartOver,
  deriveAccountKeys,
  generateTotp,
  HttpSyncAdapter,
  login,
  namedClient,
  prelogin,
  requestStartOverCode,
  type Tokens,
} from '@authx/core';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const EXTENSION_PATH = resolve(import.meta.dirname, '../dist');
// Throwaway browser profiles stay inside the project rather than in the OS temp
// directory: nothing this repo does should leave anything behind on the machine.
const PROFILE_ROOT = resolve(import.meta.dirname, '../.tmp/profiles');

/**
 * Loads the built extension into a real Chromium.
 *
 * Extensions need a persistent context and the new headless mode; the old
 * headless shell cannot run them at all. Each test gets a throwaway profile so
 * one test's vault cannot leak into the next.
 */
/**
 * Launch one Chromium with the built extension loaded. Exported separately so a
 * test can run two at once — two profiles is the only honest way to test sync.
 */
export async function launchExtension(
  extraArgs: string[] = [],
  {
    colorScheme = 'light',
    deviceScaleFactor,
    locale,
  }: { colorScheme?: 'light' | 'dark'; deviceScaleFactor?: number; locale?: string } = {},
) {
  mkdirSync(PROFILE_ROOT, { recursive: true });
  const profile = mkdtempSync(join(PROFILE_ROOT, 'chrome-'));
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    colorScheme,
    // Store artwork is captured at 2x and laid out at 1x, so a popup set a
    // little smaller than life stays sharp.
    deviceScaleFactor,
    // The browser's language, as a person in that country would have it:
    // what `navigator.languages` reports, and what the pages follow.
    ...(locale ? { locale } : {}),
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      ...(locale ? [`--lang=${locale}`] : []),
      // Camera tests hand Chromium a synthetic capture device here.
      ...extraArgs,
    ],
  });

  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  const extensionId = new URL(worker.url()).host;

  return {
    context,
    extensionId,
    worker,
    async close() {
      await context.close();
      rmSync(profile, { recursive: true, force: true });
    },
  };
}

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  worker: Worker;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    mkdirSync(PROFILE_ROOT, { recursive: true });
    const profile = mkdtempSync(join(PROFILE_ROOT, 'chrome-'));
    const context = await chromium.launchPersistentContext(profile, {
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    });

    await use(context);
    await context.close();
    rmSync(profile, { recursive: true, force: true });
  },

  worker: async ({ context }, use) => {
    const existing = context.serviceWorkers()[0];
    await use(existing ?? (await context.waitForEvent('serviceworker')));
  },

  extensionId: async ({ worker }, use) => {
    // chrome-extension://<id>/background.js
    await use(new URL(worker.url()).host);
  },
});

export const expect = test.expect;

/** Open the popup as a normal tab; extension pages behave the same either way. */
export async function openPopup(context: BrowserContext, extensionId: string) {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  return page;
}

export async function openOptions(context: BrowserContext, extensionId: string) {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/options.html`);
  return page;
}

export function base32Bytes(input: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of input) {
    value = (value << 5) | alphabet.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** Build a Google Authenticator export payload, protobuf wire format by hand. */
export function migrationUri(
  entries: { secret: string; name: string; issuer: string }[],
  batch: { size: number; index: number; id?: number } = { size: 1, index: 0 },
): string {
  const varint = (value: number): number[] => {
    const out: number[] = [];
    let rest = value;
    while (rest > 0x7f) {
      out.push((rest & 0x7f) | 0x80);
      rest = Math.floor(rest / 128);
    }
    out.push(rest);
    return out;
  };
  const tag = (field: number, wire: number) => varint((field << 3) | wire);
  const bytes = (field: number, value: Buffer | Uint8Array) => [
    ...tag(field, 2),
    ...varint(value.length),
    ...value,
  ];
  const str = (field: number, value: string) => bytes(field, Buffer.from(value, 'utf8'));
  const num = (field: number, value: number) => [...tag(field, 0), ...varint(value)];

  const body: number[] = [];
  for (const entry of entries) {
    const params = [
      ...bytes(1, base32Bytes(entry.secret)),
      ...str(2, entry.name),
      ...str(3, entry.issuer),
      ...num(4, 1), // SHA1
      ...num(5, 1), // six digits
      ...num(6, 2), // TOTP
    ];
    body.push(...tag(1, 2), ...varint(params.length), ...params);
  }
  body.push(...num(2, 1), ...num(3, batch.size), ...num(4, batch.index));
  if (batch.id !== undefined) body.push(...num(5, batch.id));

  return `otpauth-migration://offline?data=${encodeURIComponent(
    Buffer.from(body).toString('base64'),
  )}`;
}

export async function createDeviceVault(page: Page) {
  await page.getByRole('button', { name: /Just start/ }).click();
  await expect(page.getByText('No accounts yet')).toBeVisible();
}

/** The tab-local switch `breakRendering` flips; sessionStorage, so a reload keeps it. */
const BREAK_RENDERING = 'authx.e2e.breakRendering';
/** What the broken screen throws, so a test can tell its error from any other. */
/**
 * Gets past a freshly issued recovery key the way a person must: "I have
 * saved it", then the two groups the sheet asks for, read off the key.
 * Returns the key as shown.
 */
export async function saveRecoveryKey(page: Page): Promise<string> {
  const code = page.locator('code.code-digits');
  await expect(code).toBeVisible({ timeout: 30_000 });
  const key = (await code.innerText()).replace(/\s/g, '');
  await page.getByRole('button', { name: 'I have saved it' }).click();
  const groups = key.split('-');
  for (const field of await page.locator('input[data-group]').all()) {
    await field.fill(groups[Number(await field.getAttribute('data-group')) - 1]!);
  }
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  return key;
}

export const RENDER_FAULT = 'e2e: this screen was made to throw while drawing';

/**
 * Lets a test make a screen throw while drawing, the way an account with an
 * empty secret once made "Share or move" throw in 0.4.0. The vault's answer
 * reaches the page with its accounts behind a getter that throws, so the
 * first screen that lists them fails mid-render — what any malformed field
 * would do. Install once per context, before opening a page; nothing changes
 * until `breakRendering` is called on a tab.
 */
export async function allowBreakingRender(context: BrowserContext) {
  await context.addInitScript(
    ([key, fault]) => {
      const runtime = (globalThis as { chrome?: typeof chrome }).chrome?.runtime;
      if (!runtime?.sendMessage) return;
      const send = runtime.sendMessage.bind(runtime) as (message: unknown) => Promise<unknown>;
      (runtime as { sendMessage: unknown }).sendMessage = async (message: unknown) => {
        const reply = (await send(message)) as
          | { ok?: boolean; value?: { state?: string; data?: object } }
          | undefined;
        if (sessionStorage.getItem(key) && reply?.ok && reply.value?.state === 'unlocked' && reply.value.data) {
          Object.defineProperty(reply.value.data, 'items', {
            get() {
              throw new Error(fault);
            },
          });
        }
        return reply;
      };
    },
    [BREAK_RENDERING, RENDER_FAULT] as const,
  );
}

/** From the next load on, this tab's screens throw while drawing (see `allowBreakingRender`). */
export async function breakRendering(page: Page, broken = true) {
  await page.evaluate(
    ([key, on]) => (on ? sessionStorage.setItem(key, '1') : sessionStorage.removeItem(key)),
    [BREAK_RENDERING, broken] as const,
  );
}

const DEV_SERVER = 'http://localhost:8799';

/**
 * Someone with the inbox asks to start the account over on the account page
 * (the development server takes localhost:5174 as the page): it waits its
 * week, and every browser signed in is shown the day. Returns that day.
 */
export async function askToStartOverOnThePage(email: string, deviceName: string): Promise<number> {
  const asThePage = (input: string, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    headers.set('origin', 'http://localhost:5174');
    return fetch(input, { ...init, headers });
  };
  // An address gets one code a minute, and the sign-up's was just sent: wait
  // as long as the server says, once.
  await requestStartOverCode(DEV_SERVER, email, asThePage).catch(async (error: Error) => {
    const seconds = Number(error.message.match(/another in (\d+) seconds/)?.[1]);
    if (!seconds) throw error;
    await new Promise((done) => setTimeout(done, (seconds + 1) * 1000));
    await requestStartOverCode(DEV_SERVER, email, asThePage);
  });
  let code: string | undefined;
  await expect
    .poll(async () => {
      const response = await fetch(`${DEV_SERVER}/__dev/mailbox/${encodeURIComponent(email.toLowerCase())}`);
      if (!response.ok) return undefined;
      const message = (await response.json()) as { subject: string; text?: string };
      code = message.subject === 'Your Keyrook code to start your account over' ? codeInMail(message) : undefined;
      return code;
    }, { timeout: 15_000 })
    .toBeTruthy();
  const { executesAt } = await consoleStartOver(
    { baseUrl: DEV_SERVER, fetcher: asThePage },
    { email, code: code!, newPassword: 'the password whoever asked chose', deviceId: 'web-e2e', deviceName },
  );
  return executesAt;
}

/** The account page, as the development server takes it: its origin, and a client that names itself. */
const asTheAccountPage = namedClient((input: string, init?: RequestInit) => {
  const headers = new Headers(init?.headers);
  headers.set('origin', 'http://localhost:5174');
  return fetch(input, { ...init, headers });
}, 'console/0.1.0');

/**
 * The owner turns two-step sign-in on, as account.keyrook.com does, with the
 * password: the development server offers it, production not yet. Returns the
 * authenticator app's secret; the code that confirmed it is spent.
 */
export async function turnOnSecondStep(email: string, password: string): Promise<string> {
  const keys = await deriveAccountKeys(password, await prelogin(DEV_SERVER, email, asTheAccountPage));
  const session = await login(DEV_SERVER, { email, authHash: keys.authHash, deviceId: 'web-2fa', deviceName: 'Web' }, asTheAccountPage);
  let tokens: Tokens | null = session;
  const api = new HttpSyncAdapter({
    baseUrl: DEV_SERVER,
    fetcher: asTheAccountPage,
    tokens: { get: async () => tokens, set: async (next) => void (tokens = next), clear: async () => void (tokens = null) },
  });
  const { secret } = await api.beginSecondStep({ authHash: keys.authHash });
  await api.confirmSecondStep(await stepCode(secret));
  return secret;
}

/** The code an authenticator app shows for `secret`, `steps` half-minutes on: each code is taken once. */
export function stepCode(secret: string, steps = 0): Promise<string> {
  return generateTotp(secret, {}, Date.now() + steps * 30_000);
}

/**
 * Touch ID, Windows Hello and the like, stood in for by Chromium's virtual
 * authenticator on `page`: a platform one that checks the person and answers
 * PRF, as the real ones that can hold a key do. Returns how many passkeys it
 * holds.
 */
export async function platformAuthenticator(page: Page, { prf = true } = {}): Promise<() => Promise<number>> {
  const { passkeys } = await virtualAuthenticator(page, 'internal', prf);
  return async () => (await passkeys()).length;
}

/**
 * A USB security key with a PIN, stood in for the same way: one that roams,
 * checks the person and answers PRF — hmac-secret, as Chrome asks a key — as
 * FIDO2 keys do; without `prf`, an older key that cannot. Returns its passkeys
 * and how often each has answered, which says which authenticator opened the
 * vault when the computer's is there too.
 */
export async function securityKeyAuthenticator(
  page: Page,
  { prf = true } = {},
): Promise<() => Promise<{ credentialId: string; signCount: number }[]>> {
  return (await virtualAuthenticator(page, 'usb', prf)).passkeys;
}

async function virtualAuthenticator(page: Page, transport: 'internal' | 'usb', prf: boolean) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      ctap2Version: 'ctap2_1',
      transport,
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      hasPrf: prf,
      automaticPresenceSimulation: true,
    },
  });
  return {
    passkeys: async () =>
      (await cdp.send('WebAuthn.getCredentials', { authenticatorId })).credentials.map(({ credentialId, signCount }) => ({
        credentialId,
        signCount,
      })),
  };
}

/**
 * The code in a Keyrook email, as the kit's own `codeFor` reads it: on a line
 * of its own, indented. The subject no longer carries it (keyrook-account's
 * docs/console.md, S22). It is written "482913" until every product's field
 * takes "482 913", and grouped after; either is read.
 */
export function codeInMail(message: { text?: string }): string | undefined {
  const match = /^ {4}(\d{3}) ?(\d{3})$/m.exec(message.text ?? '');
  return match ? `${match[1]}${match[2]}` : undefined;
}
