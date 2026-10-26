import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { LOCALES } from '@authx/ui/i18n/locales.js';

/**
 * What each store will take, in every language the listing is written in.
 * The stores check these themselves, but only at submission, one language at
 * a time, and a refusal there means another week in review.
 *
 * - Edge Add-ons refuses a name over 45 characters (Chrome allows 75), a
 *   description under 250 or over 10,000, and more than seven search terms,
 *   30 characters each, 21 words in all.
 * - Chrome's summary is 132 characters, and its policy calls a keyword
 *   repeated more than five times in a description keyword spam.
 */
interface StoreLocale {
  name: string;
  description: string;
  locked: string;
  fill: string;
  terms: string[];
}

const ROOT = resolve(import.meta.dirname, '..');
const LISTINGS = resolve(ROOT, '../../store-assets/listings');

/** The locales Chrome reads from `_locales` (developer.chrome.com, chrome.i18n). */
const CHROME_LOCALES = new Set(
  'ar am bg bn ca cs da de el en en_AU en_GB en_US es es_419 et fa fi fil fr gu he hi hr hu id it ja kn ko lt lv ml mr ms nl no pl pt_BR pt_PT ro ru sk sl sr sv sw ta te th tr uk vi zh_CN zh_TW'.split(
    ' ',
  ),
);

const length = (text: string) => [...text].length;

/**
 * Occurrences of a term as a word of its own, ignoring case: "authenticator"
 * counts in "Google Authenticator", but "OTP" does not in "TOTP" or "andOTP" —
 * those are other words. Only Latin letters and digits mark a word's edge;
 * Chinese and Japanese have no spaces, so there any occurrence counts.
 */
function occurrences(text: string, term: string): number {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...text.matchAll(new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, 'giu'))].length;
}

let STORE_LOCALES: Record<string, StoreLocale>;

beforeAll(async () => {
  ({ STORE_LOCALES } = await import(pathToFileURL(resolve(ROOT, 'scripts/store-locales.mjs')).href));
});

describe('the store listing', () => {
  it('is written in locales Chrome knows', () => {
    expect(Object.keys(STORE_LOCALES).filter((code) => !CHROME_LOCALES.has(code))).toEqual([]);
  });

  it('is there for every language the extension speaks', () => {
    const missing = LOCALES.map((locale) => locale.replace('-', '_')).filter((code) => !(code in STORE_LOCALES));
    expect(missing).toEqual([]);
  });

  it('is in no language the extension does not speak', () => {
    // A page found in Swahili that opens on an English extension is an
    // uninstall. Regional pages share their language's translation.
    const regional: Record<string, string> = { en_US: 'en', en_GB: 'en', en_AU: 'en', es_419: 'es', pt_PT: 'pt-BR' };
    const missing = Object.keys(STORE_LOCALES).filter((code) => {
      const locale = regional[code] ?? code.replace('_', '-');
      return !(LOCALES as readonly string[]).includes(locale);
    });
    expect(missing).toEqual([]);
  });

  it('counts the languages the extension speaks, in every description', () => {
    // Every description says how many; adding a language has to update them.
    const count = LOCALES.length;
    const wrong = Object.keys(STORE_LOCALES).filter((code) => {
      const path = resolve(LISTINGS, `${code}.txt`);
      if (!existsSync(path)) return false;
      const text = readFileSync(path, 'utf8');
      const native = new Intl.NumberFormat(code.replace('_', '-')).format(count);
      return !new RegExp(`(?<!\\d)${count}(?!\\d)`).test(text) && !text.includes(native);
    });
    expect(wrong).toEqual([]);
  });

  it('fits every store, in every language', () => {
    const wrong = Object.entries(STORE_LOCALES).flatMap(([code, entry]) => {
      const words = entry.terms.reduce((sum, term) => sum + term.trim().split(/\s+/).length, 0);
      return [
        length(entry.name) > 45 && `${code}: name`,
        length(entry.description) > 132 && `${code}: summary`,
        !entry.locked.startsWith('Keyrook') && `${code}: locked`,
        !entry.fill.trim() && `${code}: fill`,
        (entry.terms.length > 7 || words > 21 || entry.terms.some((term) => length(term) > 30)) && `${code}: terms`,
      ].filter(Boolean);
    });
    expect(wrong).toEqual([]);
  });

  // The descriptions are pasted into the dashboards, and stay out of the
  // published source with the rest of store-assets/. Here, a missing one fails.
  it.skipIf(!existsSync(LISTINGS))('has a description for each language, of a length Edge accepts', () => {
    const wrong = Object.keys(STORE_LOCALES).filter((code) => {
      const path = resolve(LISTINGS, `${code}.txt`);
      if (!existsSync(path)) return true;
      const text = readFileSync(path, 'utf8');
      return length(text) < 250 || length(text) > 10_000;
    });
    expect(wrong).toEqual([]);
  });

  it('never repeats a search term more than five times', () => {
    const wrong = Object.entries(STORE_LOCALES).flatMap(([code, entry]) => {
      const path = resolve(LISTINGS, `${code}.txt`);
      if (!existsSync(path)) return [];
      const text = readFileSync(path, 'utf8');
      return [...entry.terms, 'Keyrook']
        .filter((term) => occurrences(text, term) > 5)
        .map((term) => `${code}: ${term} ×${occurrences(text, term)}`);
    });
    expect(wrong).toEqual([]);
  });

  // Chrome's keyword-spam policy (Yellow Argon) rejected 0.3.3 for naming the
  // apps we import from and the sites we work with: a list of other
  // companies' names reads as search bait, however true each one is.
  it.skipIf(!existsSync(LISTINGS))('lists no other companies by name', () => {
    const NAMES = /\b(Aegis|2FAS|andOTP|FreeOTP\+?|Ente Auth|Bitwarden|Proton|1Password|LastPass|Dashlane|KeePassXC|Steam Desktop Authenticator|Authy|Microsoft|Amazon)\b/g;
    const wrong = Object.keys(STORE_LOCALES).flatMap((code) => {
      const path = resolve(LISTINGS, `${code}.txt`);
      if (!existsSync(path)) return [];
      return [...readFileSync(path, 'utf8').matchAll(NAMES)].map((match) => `${code}: ${match[0]}`);
    });
    expect(wrong).toEqual([]);
  });

  it('names the brand, and only as the last words of a name', () => {
    // A name that leads with the brand spends the words search reads first on
    // a word nobody searches for yet.
    const wrong = Object.entries(STORE_LOCALES)
      .filter(([, { name }]) => name.includes('Keyrook') && !name.endsWith('Keyrook'))
      .map(([code]) => code);
    expect(wrong).toEqual([]);
  });
});
