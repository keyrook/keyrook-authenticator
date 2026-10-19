/**
 * Sharing an account's codes for a while, by link.
 *
 * The link carries the codes themselves, worked out ahead for the time asked
 * for — never the secret. Whoever holds a secret makes codes for ever, so a
 * link that held one could not be limited to anything; a link that holds
 * twenty codes stops when they run out, on every copy of it.
 *
 * They travel in the URL's fragment, which a browser never sends to the
 * server, to a page on keyrook.com that only reads its own address and the
 * clock (site/src/share.ts). Nothing is stored anywhere, so nothing can be
 * taken back either: the link works until it ends, for anyone who has it.
 */
import { generateHotp } from './totp.js';
import type { OtpAlgorithm } from './types.js';

/** What a link can be made for, in minutes. An hour is the most. */
export const SHARE_MINUTES = [5, 15, 60] as const;
export type ShareMinutes = (typeof SHARE_MINUTES)[number];

/** Where a shared link opens. The page connects nowhere (its policy says so). */
export const SHARE_PAGE_URL = 'https://keyrook.com/authenticator/share/';

/** The format's version: a page meeting a newer one says so rather than guessing. */
const VERSION = 1;
/** Bounds a reader holds a link to, whoever made it. */
const MAX_TEXT = 128;
const MAX_MINUTES = 60;
const PERIODS = [15, 30, 60, 90, 120];

export interface SharedCodes {
  issuer: string;
  label: string;
  digits: number;
  /** Seconds each code lasts. */
  period: number;
  /** The time step of the first code: `floor(seconds / period)`. */
  start: number;
  /** One code per step from `start`, in order. */
  codes: string[];
}

interface Shareable {
  type: 'totp' | 'hotp';
  secret: string;
  algorithm: OtpAlgorithm;
  digits: number;
  period: number;
  issuer: string;
  label: string;
}

/** Epoch milliseconds when the last code in it stops working. */
export function sharedUntil(shared: Pick<SharedCodes, 'start' | 'period' | 'codes'>): number {
  return (shared.start + shared.codes.length) * shared.period * 1000;
}

/**
 * The codes from now until at least `minutes` from now, each in full: the
 * last one runs to the end of its own step, so a link lasts between `minutes`
 * and `minutes` plus one period.
 */
export async function shareCodes(item: Shareable, minutes: ShareMinutes, now: number = Date.now()): Promise<SharedCodes> {
  // A counter-based code is used up when it is made; there is no "for a while".
  if (item.type !== 'totp') throw new Error('Only time-based codes can be shared for a while.');
  if (!SHARE_MINUTES.includes(minutes)) throw new Error('Not a length a link can be made for.');
  const start = Math.floor(now / 1000 / item.period);
  const end = Math.ceil((now / 1000 + minutes * 60) / item.period);
  const codes: string[] = [];
  for (let step = start; step < end; step++) {
    codes.push(await generateHotp(item.secret, step, item.algorithm, item.digits));
  }
  return {
    issuer: item.issuer.slice(0, MAX_TEXT),
    label: item.label.slice(0, MAX_TEXT),
    digits: item.digits,
    period: item.period,
    start,
    codes,
  };
}

/** The link that opens the share page on these codes. */
export function shareLink(shared: SharedCodes, page: string = SHARE_PAGE_URL): string {
  const body = {
    v: VERSION,
    i: shared.issuer,
    l: shared.label,
    d: shared.digits,
    p: shared.period,
    s: shared.start,
    c: shared.codes.join(''),
  };
  return `${page}#${toBase64Url(new TextEncoder().encode(JSON.stringify(body)))}`;
}

/**
 * The codes in a link's fragment, or why there are none. The fragment is
 * whatever was pasted or typed, so every field is checked and bounded before
 * the page shows any of it.
 */
export function readSharedCodes(fragment: string): SharedCodes {
  const text = fragment.replace(/^#/, '').trim();
  if (!text) throw new Error('This link has no codes in it.');
  if (text.length > 4096 || !/^[A-Za-z0-9_-]+$/.test(text)) throw new Error('This link is damaged.');
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(fromBase64Url(text)));
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    throw new Error('This link is damaged.');
  }
  if (typeof body.v === 'number' && body.v > VERSION) throw new Error('This link was made by a newer version of Keyrook Authenticator.');
  const { v, i, l, d, p, s, c } = body;
  const text128 = (value: unknown) => typeof value === 'string' && value.length <= MAX_TEXT;
  if (
    v !== VERSION ||
    !text128(i) ||
    !text128(l) ||
    typeof d !== 'number' ||
    !Number.isInteger(d) ||
    d < 6 ||
    d > 10 ||
    typeof p !== 'number' ||
    !PERIODS.includes(p) ||
    typeof s !== 'number' ||
    !Number.isSafeInteger(s) ||
    s < 0 ||
    typeof c !== 'string' ||
    !/^\d+$/.test(c) ||
    c.length % d !== 0
  ) {
    throw new Error('This link is damaged.');
  }
  const count = c.length / d;
  // More codes than an hour holds is not a link this app makes.
  if (count < 1 || count > Math.ceil((MAX_MINUTES * 60) / p) + 1) throw new Error('This link is damaged.');
  const codes = Array.from({ length: count }, (_, index) => c.slice(index * d, (index + 1) * d));
  return { issuer: i as string, label: l as string, digits: d, period: p, start: s, codes };
}

export type SharedNow =
  | { state: 'early'; startsIn: number }
  | { state: 'ended' }
  | { state: 'code'; code: string; next: string | null; remaining: number; endsAt: number };

/**
 * The code for this moment. Early means the reader's clock is behind the
 * maker's by more than a step: showing the first code anyway would show one
 * the site has not yet reached.
 */
export function sharedCodeAt(shared: SharedCodes, now: number = Date.now()): SharedNow {
  const seconds = now / 1000;
  const step = Math.floor(seconds / shared.period);
  if (step < shared.start) return { state: 'early', startsIn: shared.start * shared.period - seconds };
  const index = step - shared.start;
  if (index >= shared.codes.length) return { state: 'ended' };
  return {
    state: 'code',
    code: shared.codes[index]!,
    next: shared.codes[index + 1] ?? null,
    remaining: (step + 1) * shared.period - seconds,
    endsAt: sharedUntil(shared),
  };
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
