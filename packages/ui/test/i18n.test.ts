import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { format, placeholdersOf, tagsOf, type Message, type Plural } from '../src/i18n/format.js';
import { KNOWN_MESSAGES, KNOWN_PATTERNS, knownMessage } from '../src/i18n/errors.js';
import { detectLocale, LOADERS, LOCALES } from '../src/i18n/locales.js';
import { en } from '../src/i18n/locales/en.js';
import { de } from '../src/i18n/locales/de.js';

/**
 * What keeps every language saying the same thing: every translation has every
 * message, with the same values and tags in it, and the plural forms its
 * language needs; nothing a person can read is left in the code; and every
 * English sentence that reaches a page from the core or the server has a
 * translation to go to.
 */
const ROOT = resolve(import.meta.dirname, '..');
const REPO = resolve(ROOT, '../..');

// Every language the picker offers, loaded the way a page loads it.
const TRANSLATIONS = Object.fromEntries(
  await Promise.all(Object.entries(LOADERS).map(async ([locale, load]) => [locale, await load()] as const)),
);

describe('the language files', () => {
  it('cover every language the picker offers', () => {
    expect(Object.keys(TRANSLATIONS).sort()).toEqual(LOCALES.filter((locale) => locale !== 'en').sort());
  });

  for (const [locale, dictionary] of Object.entries(TRANSLATIONS)) {
    describe(locale, () => {
      const entries = Object.entries(en) as [keyof typeof en, Message][];

      it('has every message, and nothing else', () => {
        expect(Object.keys(dictionary).sort()).toEqual(Object.keys(en).sort());
      });

      it('keeps every value and tag the English has', () => {
        const wrong = entries.filter(([key, english]) => {
          const theirs = dictionary[key] as Message;
          return (
            JSON.stringify(placeholdersOf(theirs)) !== JSON.stringify(placeholdersOf(english)) ||
            JSON.stringify(tagsOf(theirs)) !== JSON.stringify(tagsOf(english))
          );
        });
        expect(wrong.map(([key]) => key)).toEqual([]);
      });

      it('has the plural forms its language uses, and no empty text', () => {
        const categories = new Intl.PluralRules(locale).resolvedOptions().pluralCategories;
        const wrong = entries.filter(([key, english]) => {
          const theirs = dictionary[key] as Message;
          // A message that is only a full stop may be empty: Thai ends a sentence without one.
          if (typeof english === 'string') {
            return typeof theirs !== 'string' || (theirs.trim() === '' && !/^\p{P}+$/u.test(english));
          }
          if (typeof theirs === 'string') return true;
          // `many` and the rest fall back to `other`; `one` is what reads wrong without its own form.
          // Arabic is the exception: a count of two, or of three to ten, takes another word entirely.
          const needed = categories.filter(
            (category) => locale === 'ar' || category === 'one' || category === 'other',
          );
          return needed.some((category) => !(theirs as Plural)[category as keyof Plural]?.trim());
        });
        expect(wrong.map(([key]) => key)).toEqual([]);
      });

      it('formats every message without leaving a placeholder behind', () => {
        const leftover = entries.filter(([key, english]) => {
          const values = Object.fromEntries(placeholdersOf(english).map((name) => [name, name === 'count' ? 2 : 'x']));
          return /\{\w+\}/.test(format(dictionary[key] as Message, locale, values));
        });
        expect(leftover.map(([key]) => key)).toEqual([]);
      });
    });
  }
});

describe('choosing a language', () => {
  it('takes the first the browser lists that the extension speaks', () => {
    expect(detectLocale(['de-AT', 'en'])).toBe('de');
    expect(detectLocale(['es-MX', 'pt-BR', 'en'])).toBe('es');
    expect(detectLocale(['ja'])).toBe('ja');
    expect(detectLocale(['vi', 'ru'])).toBe('vi');
    expect(detectLocale(['ar-EG'])).toBe('ar');
    expect(detectLocale(['ru', 'uk'])).toBe('ru');
    expect(detectLocale(['yo', 'zu'])).toBe('en');
  });

  it('finds a language under the older tags browsers still send', () => {
    expect(detectLocale(['nb-NO'])).toBe('no');
    expect(detectLocale(['nn'])).toBe('no');
    expect(detectLocale(['iw'])).toBe('he');
    expect(detectLocale(['in-ID'])).toBe('id');
    expect(detectLocale(['tl-PH'])).toBe('fil');
  });

  it('gives the Brazilian Portuguese to every reader of Portuguese', () => {
    expect(detectLocale(['pt-BR'])).toBe('pt-BR');
    expect(detectLocale(['pt-PT', 'en'])).toBe('pt-BR');
    expect(detectLocale(['pt'])).toBe('pt-BR');
  });

  it('gives Traditional Chinese to Taiwan and Hong Kong, and Simplified to everyone else', () => {
    expect(detectLocale(['zh-TW'])).toBe('zh-TW');
    expect(detectLocale(['zh-HK'])).toBe('zh-TW');
    expect(detectLocale(['zh-Hant'])).toBe('zh-TW');
    expect(detectLocale(['zh-CN', 'fr'])).toBe('zh-CN');
    expect(detectLocale(['zh-SG'])).toBe('zh-CN');
    expect(detectLocale(['zh'])).toBe('zh-CN');
  });

  it('picks the plural form by the count, in each language', () => {
    const message = en['vault.count'];
    expect(format(message, 'en', { count: 1 })).toBe('1 account');
    expect(format(message, 'en', { count: 1200 })).toBe('1,200 accounts');
    expect(format(de['vault.count'], 'de', { count: 1200 })).toContain('1.200');
  });
});

/** Every file under a directory with one of these endings. */
function files(dir: string, endings: string[]): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path, endings);
    return endings.some((ending) => name.endsWith(ending)) ? [path] : [];
  });
}

describe('English that comes from elsewhere', () => {
  it('names only messages that exist', () => {
    const keys = new Set(Object.keys(en));
    const unknown = [...Object.values(KNOWN_MESSAGES), ...KNOWN_PATTERNS.map(([, key]) => key)].filter(
      (key) => !keys.has(key),
    );
    expect(unknown).toEqual([]);
  });

  /**
   * Thrown somewhere a page can show it, but not something a person meets:
   * a programming error, or a guard against a malformed file the friendlier
   * checks above it already refuse.
   */
  const INTERNAL = new Set([
    'KDF iteration count is below the safe minimum',
    'Hex string has odd length',
    'Invalid hex string',
    'digits must be between 6 and 10',
    'period must be positive',
    'Malformed pairing key.',
    'A pairing needs two different keys.',
    'The server returned too short a salt.',
    'Account KDF iteration count is below the safe minimum',
    'Malformed recovery state.',
    'scrypt N must be a power of two',
    // A server that hands out KDF settings the client refuses is a hostile
    // one; the refusal is the protection, and its wording is for the log.
    'Unsupported KDF: 12',
    'Unsupported account KDF: 12',
    'The server asked for an unsupported KDF: 12',
    'The server asked for 12 KDF iterations, ',
    // @keyrook/account's keys per product, which this app does not use yet.
    // When it does (0.4), the refusals a person can meet get translations.
    'Malformed account id.',
    'Malformed account key.',
    'Malformed root pin.',
    'Not a Keyrook product name.',
    // A removal proof's guards on this device's own values, which it always
    // sends well formed; what the server sent never throws.
    'Malformed device id.',
    'Malformed removal time.',
    'Malformed sign-in time.',
    'That box was not sealed to this account.',
    'That is not an account key.',
    // A shared link's: the share page shows these, in English like the page,
    // and the app offers only what it can make.
    'Only time-based codes can be shared for a while.',
    'Not a length a link can be made for.',
    'This link has no codes in it.',
    'This link is damaged.',
    'This link was made by a newer version of Keyrook Authenticator.',
    // A caller using the flows wrongly, which this app's code never does.
    'A password account’s root must be wrapped under the password.',
    'Keyrook Authenticator makes an account without a root.',
    'Only Keyrook Authenticator has older builds to keep working.',
    // The server's answers to the account page, or to a product calling what
    // only the page may; this app calls none of it.
    'Only the account page can ask for this.',
    'Only the account page reads every product’s key box.',
    'The account page cannot do that.',
    // Asking to start an account over, which this app never does: Passhold
    // and the account page do (keyrook-account's design, section 10).
    'This account already starts over on 12.',
    'Update this app to start the account over: it now takes effect a week after it is asked for.',
    // Cancelling one that another device cancelled first: done either way.
    'This account has no start over waiting.',
    // Passkeys are added, listed, removed and given the root on the account
    // page alone, and this app never proves the owner with one: what only
    // those can meet. A malformed id is a server's, refused for the log.
    'Add a passkey on account.keyrook.com.',
    'That passkey is already on a Keyrook account.',
    'That passkey is not on this account.',
    'This account already has 10 passkeys. Remove one before adding another.',
    'That passkey does not unlock this account. Confirm with the password instead.',
    'The passkey’s wrap did not open again. Nothing was changed.',
    'That passkey did not confirm it is you. Try again.',
    'This account has no passkey.',
    'Malformed passkey id.',
    // The account page's alone: setting up the keys of an account only this
    // app used, the ways to sign in added and removed, two-step sign-in
    // turned on and off.
    'Confirm with the password, or the recovery key and a sign-in with Google or GitHub.',
    'Keyrook Authenticator’s key is not under this password yet. Open Keyrook Authenticator once, then try again.',
    'This account has no key of Keyrook Authenticator’s to set its keys up from.',
    'That Google or GitHub account already signs in to another Keyrook account.',
    'That Google or GitHub account has another email address than this Keyrook account.',
    'That sign-in is not on this account.',
    'This account already has a password.',
    'This account already signs in with an account of that provider.',
    'This account already signs in with it.',
    'This is the only way to sign in to this account.',
    'Start turning on two-step sign-in again.',
    'Two-step sign-in is already off.',
    'Two-step sign-in is already on.',
    'Two-step sign-in is not offered yet.',
    // Naming the account (keyrook-account's S22): this app never sets a name,
    // so it never meets the server's refusal of one.
    'A name may hold letters, spaces, apostrophes, hyphens and full stops, up to 64 characters.',
    // Moving the account to a new address (keyrook-account's U2) is the
    // account page's: this app never asks for it, only learns the address
    // from GET /account/keys.
    'That is already this account’s address.',
    // Families (keyrook-account's docs/family.md): made, joined, shared and
    // recovered on the account page, or by a product sharing through one.
    // This app shows no family and calls no /orgs or /auth/family-recovery
    // route. Three ride on what it does call, and it meets none of them:
    // deleting an account that alone organises a family, and replacing the
    // root, are the account page's; replacing this app's key refuses only a
    // member key's box under it, which this app never puts and the server
    // takes from no other. When it shares a group of codes, what a person can
    // meet there gets translations, and `ProductFamily.left` gets a sentence
    // of this app's own: naming whoever the roster dropped is the only way a
    // server's putting someone out is seen.
    'A collection needs a name of up to 128 characters.',
    'A collection’s key goes only to confirmed members of the family. Load the family again.',
    'A collection’s new key goes only to those already in it. Load the family again.',
    'A collection’s new key must go to everyone still in it, and to nobody else. Load the family again.',
    'A family has at most 2 organisers, counting those invited.',
    'A family has at most 6 people, counting those invited.',
    'A family has at most 64 collections.',
    'A free family has at most 2 collections.',
    'A new family’s roster is its first: version 1, generation 1.',
    'A new organiser needs the family’s recovery key. Load the family again.',
    'A record stays in the collection it was made in.',
    'An app makes only its own collections.',
    'An app puts only its own box here.',
    'An organiser can step down only themselves.',
    'An organiser’s word goes only to confirmed members of the family. Load the family again.',
    'Ask another organiser of your family to help you.',
    'Ask for it first: it opens a week after you ask, if they do not refuse.',
    'Emergency access is not part of a free family.',
    'Emergency access is only between members of a family.',
    'Families are not offered yet.',
    'It is not open yet: it opens a week after you asked, if they do not refuse.',
    'Malformed collection holders.',
    'Malformed collection name.',
    'Malformed family pin.',
    'Malformed family record.',
    'Malformed family roster.',
    'Malformed join code.',
    'Malformed key generation.',
    'Malformed member key.',
    'Malformed record revision.',
    'Malformed roster version.',
    'No organiser of your family can help you back in now.',
    'Nobody has handed your account’s key over yet.',
    'Nobody is asking for your emergency access.',
    'Nobody named you their emergency contact here.',
    'Nobody vouches for their own key.',
    'Only a family can be made here.',
    'Only an organiser of this family can do that.',
    'Only someone already confirmed can be made an organiser.',
    'Only someone confirmed in the family can do that.',
    'Only the account page can do that.',
    'Only the account page keeps that.',
    'Recovery by an organiser is already on in this family. Load the family again.',
    'Recovery by an organiser is not on in this family. Load the family again.',
    'Recovery by an organiser is not on in your family.',
    'Recovery by an organiser is not part of a free family.',
    'Someone else in the family has just become its organiser. Load the family again.',
    'Someone has already helped them. Load the family again.',
    'Someone in your family has a key this browser has not seen. Compare codes with them first.',
    'Someone left this family, and its key must be changed first. Load the family again.',
    'Someone there already holds this collection’s key. Load the family again.',
    'Someone who held this collection’s key is gone, and it must be changed first. Load the family again.',
    'That address is already in this family.',
    'That address is already invited.',
    'That box does not hold a key.',
    'That box does not hold a recovery key.',
    'That box does not hold an account key.',
    'That box is not from a member key.',
    'That collection belongs to another Keyrook product.',
    'That collection id is taken. Make the collection again.',
    'That collection’s key has changed. Load the family again.',
    'That family id is taken. Make the family again.',
    'That family roster is older than one this device has seen.',
    'That family roster was not made by anyone in the family.',
    'That is not a collection of yours in this family.',
    'That is not a member key.',
    'That is not one of this family’s collections, or its key has changed. Load the family again.',
    'That is not the collection key’s next generation. Load the family again.',
    'That is not the family key’s next generation. Load the family again.',
    'That is not the recovery key in use. Load the family again.',
    'That is not the recovery key the family’s roster lists.',
    'That is not the recovery key’s next generation. Load the family again.',
    'That key did not come from the organiser whose code you checked. Nothing was changed.',
    'That member key was not sealed to this account.',
    'That person is not in this family.',
    'That person is not waiting to be confirmed.',
    'That record is under a key you do not hold.',
    'That request is over. Ask again.',
    'That request is over. Load the family again.',
    'That roster is not for the family key in use. Load the family again.',
    'That roster is not for the new family key. Load the family again.',
    'That roster is not the next one. Load the family again.',
    'The account’s root key is not the one this app trusts. Open this app’s key again first.',
    'The family’s list of members does not name that person. Load the family again.',
    'The family’s list of members does not name who sent you its key.',
    'The family’s list of members names another key for you.',
    'The key handed over is not this account’s. Ask again.',
    'The key was handed over by someone this page showed no code for. Nothing was changed.',
    'The new family key must go to everyone in the family, and to nobody else. Load the family again.',
    'The recovery key must go to every organiser of the family, and to nobody else. Load the family again.',
    'The server reported an account key other than the one handed over.',
    'The server sent the key of someone else. Nothing was handed over.',
    'There is no invitation to your address for that family.',
    'There is no such collection in this family.',
    'There is no such family, or you are not in it.',
    'There is no such invitation.',
    'They already have that role.',
    'They refused less than a day ago. You can ask again tomorrow.',
    'They refused your request.',
    'This app’s key for your family changed. Look again.',
    'This family’s key does not need changing. Load the family again.',
    'You are already in a family.',
    'You are not confirmed in this family yet.',
    'You are the only organiser of your family. Make another member an organiser first.',
    'You do not hold this family’s key yet: an organiser confirms you first.',
    'You do not hold your family’s recovery key. Load the family again.',
    'You have asked already.',
    'You left a family less than 12 months ago, and can join another 12 months after leaving.',
    'Your account’s keys changed while you waited. Ask again.',
    'Your emergency contact is someone else in the family.',
    'Your emergency contact must be someone whose code was compared when they joined.',
    'Your key for your family does not open with this account’s root. Nothing was changed.',
    'Your key for your family does not open with this app’s key. Nothing was changed.',
  ]);

  // In the core, anything thrown. The server's sentences come from its kit,
  // below: only what goes back to a browser, a refusal from a route or a
  // provider's, relayed — its start-up and backup messages are for the
  // operator's terminal.
  const thrown = /new (?:Error|DecryptionError)\(\s*(['`])((?:(?!\1).)+)\1/g;

  const translated = (text: string) =>
    // A template's values are matched by shape: try it with a number in.
    INTERNAL.has(text.replace(/\$\{[^}]+\}/g, '12')) || knownMessage(text.replace(/\$\{[^}]+\}/g, '12')) !== null;

  it('has a translation for every sentence @authx/core sends', () => {
    const dir = resolve(REPO, 'packages/core/src');
    const missing: string[] = [];
    for (const file of files(dir, ['.ts'])) {
      for (const match of readFileSync(file, 'utf8').matchAll(thrown)) {
        if (!translated(match[2]!)) missing.push(`${relative(REPO, file)}: ${match[2]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  // The account server and @keyrook/account are keyrook-account's. Its kit
  // lists every sentence they can show a person, found with the same two
  // patterns as above (vendor/keyrook-account-kit, copied by `npm run
  // account`). The published source has no kit, and nothing of the server's
  // to translate.
  const KIT_MESSAGES = resolve(REPO, 'vendor/keyrook-account-kit/messages.json');
  it.skipIf(!existsSync(KIT_MESSAGES))('has a translation for every sentence the account server sends', () => {
    const { server, account } = JSON.parse(readFileSync(KIT_MESSAGES, 'utf8')) as { server: string[]; account: string[] };
    expect(server.length).toBeGreaterThan(0);
    const missing = [...server.map((text) => `server: ${text}`), ...account.map((text) => `account: ${text}`)].filter(
      (entry) => !translated(entry.slice(entry.indexOf(': ') + 2)),
    );
    expect(missing).toEqual([]);
  });
});

/**
 * Text a person reads, written straight into a component. Each of these was
 * once a sentence that stayed English in a German page.
 */
describe('the pages', () => {
  const ATTRIBUTES = new Set(['label', 'title', 'placeholder', 'aria-label', 'description', 'hint', 'subtitle', 'alt', 'footnote', 'badge', 'cancelLabel', 'withoutNativeReader', 'term', 'detail']);
  /** Not words: names, units, a code, an example key. */
  const ALLOWED = /^(?:[\s\d.,:;·•–—+%×/()[\]{}|→←↑↓▲▼'"“”‘’!?#&*@=_-]|AES-256-GCM|Alt|Shift|A|GitHub|Google|SHA-?\d*|otpauth:\/\/[\w/:.?=&@%-]*|JBSW[\w ]*|[X-]{4,}|000000|Keyrook|\d+ s)*$/;

  /**
   * Never shown: a failure of the browser's own key store, which leaves the
   * vault locked rather than saying anything; and an English message that
   * only travels with a key that is shown instead.
   */
  const QUIET = new Set([
    'Could not open the key store.',
    'Key store request failed.',
    'Key store transaction aborted.',
    'No response from the background service worker.',
  ]);

  /** Three or more words from a capital: how every sentence on these pages begins. */
  const SENTENCE = /^[A-Z][a-z’']+(?:[ ,][\w’'.,—-]+){2,}/;

  function hardcoded(file: string): string[] {
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const found: string[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isJsxText(node)) {
        const text = node.getText().trim();
        if (/[A-Za-z]{2,}/.test(text) && !ALLOWED.test(text)) found.push(text);
      }
      // A sentence anywhere else: in a ternary, a state setter, a table.
      if (
        ts.isStringLiteralLike(node) &&
        SENTENCE.test(node.text) &&
        !ts.isImportDeclaration(node.parent) &&
        !knownMessage(node.text) &&
        !QUIET.has(node.text)
      ) {
        found.push(node.text);
      }
      if (ts.isJsxAttribute(node) && ATTRIBUTES.has(node.name.getText()) && node.initializer) {
        const value = ts.isStringLiteral(node.initializer)
          ? node.initializer.text
          : ts.isJsxExpression(node.initializer) && node.initializer.expression && ts.isStringLiteralLike(node.initializer.expression)
            ? node.initializer.expression.text
            : null;
        if (value && /[a-z]{3,}/.test(value) && !ALLOWED.test(value)) found.push(`${node.name.getText()}="${value}"`);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    return found.map((text) => `${relative(REPO, file)}: ${text}`);
  }

  // The screens, and what each app wraps them in: its entry points, its host.
  it('say nothing that is not in a language file', () => {
    const sources = [resolve(ROOT, 'src'), resolve(REPO, 'apps/extension/src')];
    const pages = sources.flatMap((dir) => files(dir, ['.tsx', '.ts'])).filter(
      (file) =>
        !file.includes('/i18n/') &&
        !file.includes('/background/') &&
        !file.endsWith('.d.ts') &&
        // Service names, generated from the icon sets.
        !file.endsWith('brand-icons.ts'),
    );
    expect(pages.flatMap(hardcoded)).toEqual([]);
  });
});
