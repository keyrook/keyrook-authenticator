import { beforeEach, describe, expect, it } from 'vitest';
import { type Host, installHost } from '../src/host.js';
import { here } from '../src/i18n/device.js';
import { LOADERS } from '../src/i18n/locales.js';
import { en, type MessageKey } from '../src/i18n/locales/en.js';

const TRANSLATIONS = Object.fromEntries(
  await Promise.all(Object.entries(LOADERS).map(async ([locale, load]) => [locale, await load()] as const)),
);
const EVERY = { en, ...TRANSLATIONS } as Record<string, Record<string, unknown>>;

const namesChrome = (value: unknown) => /Chrome|chrome:\/\//.test(JSON.stringify(value));

/**
 * Sentences a Firefox build never shows: the account's passkeys, which it
 * does not ask (apps/extension/src/lib/host.ts), and the Chrome Web Store's
 * name, which only a copy from that store rates on.
 */
const NOT_IN_FIREFOX = new Set<MessageKey>([
  'error.passkey.permission',
  'error.passkey.failed',
  'passkey.where',
  'rate.store.chrome',
]);

const at = (where: Partial<Host>) => installHost({ device: 'browser', ...where } as Host);

describe('the words in Firefox', () => {
  beforeEach(() => at({ browser: 'firefox' }));

  it('never name Chrome, in any language', () => {
    const wrong: string[] = [];
    for (const key of Object.keys(en) as MessageKey[]) {
      if (!namesChrome(en[key]) || NOT_IN_FIREFOX.has(key)) continue;
      const shown = here(key);
      for (const [locale, dictionary] of Object.entries(EVERY)) {
        if (shown === key || namesChrome(dictionary[shown])) wrong.push(`${locale}: ${key}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('say the same as Chrome’s, with Firefox in it', () => {
    // A variant that drifted from its sentence would tell Firefox's users something else.
    for (const key of Object.keys(en) as MessageKey[]) {
      const shown = here(key);
      if (shown === key || key === 'about.shortcut.change') continue;
      expect(en[shown], key).toBe(String(en[key]).replaceAll('Chrome', 'Firefox'));
    }
  });
});

describe('the words in Chrome, Edge and Opera', () => {
  it('are the sentences as written', () => {
    at({});
    expect(here('camera.blocked')).toBe('camera.blocked');
    expect(here('about.shortcut.change')).toBe('about.shortcut.change');
  });

  it('on a phone are the phone’s, even if a browser were named', () => {
    at({ device: 'phone', browser: 'firefox' });
    expect(here('camera.blocked')).toBe('camera.blocked.phone');
  });
});
