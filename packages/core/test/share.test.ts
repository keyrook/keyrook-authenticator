import { describe, expect, it } from 'vitest';
import { generateSteam, generateTotp } from '../src/otp/totp.js';
import { readSharedCodes, shareCodes, sharedCodeAt, shareLink, sharedUntil, type SharedCodes } from '../src/otp/share.js';

const SECRET = 'JBSWY3DPEHPK3PXP';
const ITEM = {
  type: 'totp' as const,
  secret: SECRET,
  algorithm: 'SHA1' as const,
  digits: 6,
  period: 30,
  issuer: 'GitHub',
  label: 'minh@example.com',
};
/** 12:00:10 on a day, ten seconds into a step. */
const NOW = Date.UTC(2026, 9, 17, 12, 0, 10);

const fragmentOf = (link: string) => link.slice(link.indexOf('#'));
const encode = (body: unknown) =>
  btoa(JSON.stringify(body)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

describe('a link that shares codes for a while', () => {
  it('shows, at every moment it covers, the code the app shows', async () => {
    const shared = readSharedCodes(fragmentOf(shareLink(await shareCodes(ITEM, 15, NOW))));
    for (let at = NOW; at < NOW + 15 * 60_000; at += 7_000) {
      const now = sharedCodeAt(shared, at);
      expect(now.state).toBe('code');
      if (now.state === 'code') expect(now.code).toBe(await generateTotp(SECRET, {}, at));
    }
    expect(shared).toMatchObject({ issuer: 'GitHub', label: 'minh@example.com', digits: 6, period: 30 });
  });

  it('ends: nothing after its time, however the page is opened', async () => {
    const shared = await shareCodes(ITEM, 5, NOW);
    // At least five minutes, at most five and one step.
    expect(sharedUntil(shared) - NOW).toBeGreaterThanOrEqual(5 * 60_000);
    expect(sharedUntil(shared) - NOW).toBeLessThanOrEqual(5 * 60_000 + 30_000);
    expect(sharedCodeAt(shared, sharedUntil(shared) - 1).state).toBe('code');
    expect(sharedCodeAt(shared, sharedUntil(shared))).toEqual({ state: 'ended' });
    expect(sharedCodeAt(shared, NOW + 86_400_000)).toEqual({ state: 'ended' });
  });

  it('never carries the secret, nor anything that makes codes beyond its end', async () => {
    const link = shareLink(await shareCodes(ITEM, 60, NOW));
    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(fragmentOf(link).slice(1).replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)),
    );
    expect(decoded).not.toContain(SECRET);
    expect(decoded.toLowerCase()).not.toContain(SECRET.toLowerCase());
    expect(Object.keys(JSON.parse(decoded)).sort()).toEqual(['c', 'd', 'i', 'l', 'p', 's', 'v']);
    // An hour of 30-second codes, and the step it started in.
    expect(readSharedCodes(fragmentOf(link)).codes).toHaveLength(121);
  });

  it('opens the share page, with the codes after the # that browsers keep to themselves', async () => {
    const link = shareLink(await shareCodes(ITEM, 5, NOW));
    expect(link.startsWith('https://keyrook.com/authenticator/share/#')).toBe(true);
    expect(link.length).toBeLessThan(400);
  });

  it('says early, rather than showing a code, to a clock behind the maker’s', async () => {
    const shared = await shareCodes(ITEM, 5, NOW);
    expect(sharedCodeAt(shared, NOW - 60_000).state).toBe('early');
  });

  it('carries Steam Guard’s five characters as a link of its own kind', async () => {
    // A key whose codes Steam's own app made (otp.test.ts).
    const steam = { ...ITEM, type: 'steam' as const, secret: '63BEDWCQZKTQWPESARIERL5DTTQFCJTK', digits: 5 };
    const link = shareLink(await shareCodes(steam, 15, NOW));
    const shared = readSharedCodes(fragmentOf(link));
    expect(shared).toMatchObject({ kind: 'steam', digits: 5, period: 30 });
    for (let at = NOW; at < NOW + 15 * 60_000; at += 7_000) {
      const now = sharedCodeAt(shared, at);
      expect(now.state).toBe('code');
      if (now.state === 'code') expect(now.code).toBe(await generateSteam(steam.secret, at));
    }
    // Version 2: a page that knows only digits says a newer version made it.
    const body = JSON.parse(atob(fragmentOf(link).slice(1).replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;
    expect(body).toMatchObject({ v: 2, k: 'steam' });
    // And a link of digits stays version 1, for a page not yet updated.
    expect(JSON.parse(atob(fragmentOf(shareLink(await shareCodes(ITEM, 5, NOW))).slice(1))).v).toBe(1);
  });

  it('is made only for time-based codes, and only for the lengths offered', async () => {
    await expect(shareCodes({ ...ITEM, type: 'hotp' }, 5, NOW)).rejects.toThrow();
    await expect(shareCodes(ITEM, 600 as 5, NOW)).rejects.toThrow();
  });
});

describe('a link nobody can trust', () => {
  const good: Record<string, unknown> = { v: 1, i: 'GitHub', l: '', d: 6, p: 30, s: 59_000_000, c: '123456654321' };

  it('reads one this app would make', () => {
    expect(readSharedCodes(`#${encode(good)}`).codes).toEqual(['123456', '654321']);
  });

  it.each([
    ['empty', ''],
    ['not base64', '#not a link!'],
    ['not JSON', `#${btoa('nope')}`],
    ['an array', `#${encode([1, 2])}`],
    ['too long', `#${'A'.repeat(5000)}`],
  ])('refuses one that is %s', (_, fragment) => {
    expect(() => readSharedCodes(fragment)).toThrow();
  });

  it.each<[string, Record<string, unknown>]>([
    ['an unknown version', { v: 0 }],
    ['five digits', { d: 5 }],
    ['a period no app uses', { p: 7 }],
    ['letters among the codes', { c: '12345a654321' }],
    ['a code cut short', { c: '12345665432' }],
    ['no codes', { c: '' }],
    ['more than an hour of codes', { c: '123456'.repeat(200) }],
    ['a name longer than any', { i: 'x'.repeat(129) }],
    ['a negative start', { s: -1 }],
    ['a start that is not a number', { s: '5' }],
  ])('refuses one with %s', (_, change) => {
    expect(() => readSharedCodes(`#${encode({ ...good, ...change })}`)).toThrow('This link is damaged.');
  });

  const steam: Record<string, unknown> = { v: 2, k: 'steam', i: 'Steam', l: '', d: 5, p: 30, s: 59_000_000, c: 'FR8RV9P3VP' };

  it('reads a Steam Guard link this app would make', () => {
    expect(readSharedCodes(`#${encode(steam)}`)).toMatchObject({ kind: 'steam', codes: ['FR8RV', '9P3VP'] });
  });

  it.each<[string, Record<string, unknown>]>([
    ['version 2 that is not Steam’s', { k: undefined }],
    ['digits for codes', { c: '1234554321' }],
    ['letters Steam does not use', { c: 'FR8RVAP3VP' }],
    ['lower case', { c: 'fr8rv9p3vp' }],
    ['six characters a code', { d: 6, c: 'FR8RV9P3VPXY' }],
    ['another period', { p: 60 }],
  ])('refuses a Steam link with %s', (_, change) => {
    expect(() => readSharedCodes(`#${encode({ ...steam, ...change })}`)).toThrow('This link is damaged.');
  });

  it('refuses Steam’s letters in a link that says it is digits', () => {
    expect(() => readSharedCodes(`#${encode({ ...steam, v: 1, d: 5 })}`)).toThrow('This link is damaged.');
  });

  it('says a newer version made it, rather than misreading it', () => {
    expect(() => readSharedCodes(`#${encode({ ...good, v: 3 })}`)).toThrow('newer version');
  });

  it('keeps a hostile name as text', () => {
    const shared: SharedCodes = readSharedCodes(`#${encode({ ...good, i: '<img src=x onerror=alert(1)>' })}`);
    expect(shared.issuer).toBe('<img src=x onerror=alert(1)>');
  });
});
