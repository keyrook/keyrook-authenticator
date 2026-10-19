/**
 * The message format every language file is written in — plain enough for a
 * translator to edit without breaking anything, and checked by
 * `test/i18n.test.ts` against the English it translates.
 *
 * - `{name}` is replaced by a value. Numbers are written the locale's way.
 * - A message with a count is an object of plural forms — `one`, `other`, and
 *   whichever others the language has (`Intl.PluralRules` decides). `{count}`
 *   picks the form.
 * - `<b>…</b>` and other tags mark a stretch the page draws differently: bold,
 *   a link, code. Only the page decides what a tag becomes; the text cannot
 *   inject markup, because it never becomes HTML.
 *
 * Nothing here touches React, the DOM or `chrome.*`, so the service worker and
 * the tests can use it too.
 */

export interface Plural {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export type Message = string | Plural;

export type Values = Record<string, string | number>;

const PLACEHOLDER = /\{(\w+)\}/g;
const TAG = /<(\w+)>|<\/(\w+)>/g;

/** The form of a message for this count, in this language. */
export function pick(message: Message, locale: string, values: Values | undefined): string {
  if (typeof message === 'string') return message;
  const count = Number(values?.count ?? 0);
  const category = new Intl.PluralRules(locale).select(count) as keyof Plural;
  // English writes "1 account" as `one`; a language without a `one` form, or a
  // count of exactly zero in a language with a `zero` form, falls to `other`.
  return message[category] ?? message.other;
}

function show(value: string | number, locale: string): string {
  return typeof value === 'number' ? new Intl.NumberFormat(locale).format(value) : value;
}

/** A message with its values in, as text. Tags are dropped, their text kept. */
export function format(message: Message, locale: string, values?: Values): string {
  return pick(message, locale, values)
    .replace(PLACEHOLDER, (whole, name: string) => (values && name in values ? show(values[name]!, locale) : whole))
    .replace(TAG, '');
}

/** The placeholder names a message uses, in every one of its forms. */
export function placeholdersOf(message: Message): string[] {
  const forms = typeof message === 'string' ? [message] : Object.values(message);
  return [...new Set(forms.flatMap((form) => [...form.matchAll(PLACEHOLDER)].map((match) => match[1]!)))].sort();
}

/** The tags a message uses, in every one of its forms. */
export function tagsOf(message: Message): string[] {
  const forms = typeof message === 'string' ? [message] : Object.values(message);
  return [...new Set(forms.flatMap((form) => [...form.matchAll(TAG)].map((match) => match[1] ?? match[2]!)))].sort();
}

/**
 * Splits a message into text, placeholders and tagged stretches, for a page to
 * render. Tags do not nest; a translator who needs bold inside a link has a
 * sentence that can be written another way.
 */
export type Piece =
  | { kind: 'text'; text: string }
  | { kind: 'value'; name: string }
  | { kind: 'tag'; tag: string; pieces: Piece[] };

function flat(text: string): Piece[] {
  const pieces: Piece[] = [];
  let last = 0;
  for (const match of text.matchAll(PLACEHOLDER)) {
    if (match.index! > last) pieces.push({ kind: 'text', text: text.slice(last, match.index) });
    pieces.push({ kind: 'value', name: match[1]! });
    last = match.index! + match[0].length;
  }
  if (last < text.length) pieces.push({ kind: 'text', text: text.slice(last) });
  return pieces;
}

export function parse(text: string): Piece[] {
  const pieces: Piece[] = [];
  const tagged = /<(\w+)>([\s\S]*?)<\/\1>/g;
  let last = 0;
  for (const match of text.matchAll(tagged)) {
    if (match.index! > last) pieces.push(...flat(text.slice(last, match.index)));
    pieces.push({ kind: 'tag', tag: match[1]!, pieces: flat(match[2]!) });
    last = match.index! + match[0].length;
  }
  if (last < text.length) pieces.push(...flat(text.slice(last)));
  return pieces;
}
