import { describe, expect, test } from 'vitest';
import { importFromText, type VaultItem } from '@authx/core';
import { planScan, startSession, type ScanPlan, type ScanSession } from '../src/lib/scan-session.js';

const SECRET_A = 'JBSWY3DPEHPK3PXP';
const SECRET_B = 'MZXW6YTBOI';
const SECRET_C = 'GEZDGNBVGY3TQOJQ';

function base32Bytes(input: string): number[] {
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
  return out;
}

/** A Google Authenticator export code, protobuf by hand, independent of the decoder. */
function exportCode(
  entries: { secret: string; name: string; issuer: string }[],
  batch: { size: number; index: number; id: number },
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
  const bytes = (field: number, value: number[]) => [...tag(field, 2), ...varint(value.length), ...value];
  const str = (field: number, value: string) => bytes(field, [...Buffer.from(value, 'utf8')]);
  const num = (field: number, value: number) => [...tag(field, 0), ...varint(value)];

  const body: number[] = [];
  for (const entry of entries) {
    const params = [
      ...bytes(1, base32Bytes(entry.secret)),
      ...str(2, entry.name),
      ...str(3, entry.issuer),
      ...num(4, 1),
      ...num(5, 1),
      ...num(6, 2),
    ];
    body.push(...tag(1, 2), ...varint(params.length), ...params);
  }
  body.push(...num(2, 1), ...num(3, batch.size), ...num(4, batch.index), ...num(5, batch.id));
  return `otpauth-migration://offline?data=${encodeURIComponent(Buffer.from(body).toString('base64'))}`;
}

const single = (issuer: string, secret = SECRET_A) =>
  `otpauth://totp/${issuer}:me@example.com?secret=${secret}&issuer=${issuer}`;

/** Run a series of frames, adopting each plan the way the scanner does. */
function scan(frames: string[], existing: VaultItem[] = []): { plans: ScanPlan[]; session: ScanSession } {
  let session = startSession();
  const plans: ScanPlan[] = [];
  for (const frame of frames) {
    const plan = planScan(session, frame, existing);
    plans.push(plan);
    if (plan.kind !== 'ignore') session = plan.next;
  }
  return { plans, session };
}

describe('a single code', () => {
  test('is stored and ends the session', () => {
    const { plans } = scan([single('Alpha')]);
    expect(plans[0]).toMatchObject({ kind: 'store', finished: true });
    expect(plans[0]!.kind === 'store' && plans[0]!.items.map((item) => item.issuer)).toEqual(['Alpha']);
  });

  test('held in view is read once, however many frames decode it', () => {
    const code = single('Alpha');
    const { plans, session } = scan([code, code, code, code]);

    expect(plans.map((plan) => plan.kind)).toEqual(['store', 'ignore', 'ignore', 'ignore']);
    expect(session.added).toBe(1);
  });

  test('already in the vault is refused rather than stored twice', () => {
    const existing = importFromText(single('Alpha')).items;
    const { plans } = scan([single('Alpha')], existing);

    expect(plans[0]).toMatchObject({ kind: 'reject', reason: /already in your vault/ });
  });

  test('that is not a 2FA code is refused once, not every frame', () => {
    const wifi = 'WIFI:T:WPA;S:home;P:hunter2;;';
    const { plans } = scan([wifi, wifi, wifi]);

    expect(plans.map((plan) => plan.kind)).toEqual(['reject', 'ignore', 'ignore']);
  });
});

describe('a multi-code export', () => {
  const id = 4242;
  const parts = [
    exportCode([{ secret: SECRET_A, name: 'a', issuer: 'Alpha' }], { size: 3, index: 0, id }),
    exportCode([{ secret: SECRET_B, name: 'b', issuer: 'Beta' }], { size: 3, index: 1, id }),
    exportCode([{ secret: SECRET_C, name: 'c', issuer: 'Gamma' }], { size: 3, index: 2, id }),
  ];

  test('keeps scanning until every part is in, then stops', () => {
    const { plans, session } = scan(parts);

    expect(plans.map((plan) => plan.kind === 'store' && plan.finished)).toEqual([false, false, true]);
    expect(session.added).toBe(3);
    expect(session.batch?.seen.size).toBe(3);
  });

  test('is complete whatever order the parts are shown in', () => {
    const { plans } = scan([parts[2]!, parts[0]!, parts[1]!]);
    expect(plans.at(-1)).toMatchObject({ kind: 'store', finished: true });
  });

  test('does not count a part twice when the user flips back to it', () => {
    // The camera cycles: part 1, part 2, back to part 1. The third frame must
    // neither store part 1 again nor be mistaken for the missing part 3.
    const { plans, session } = scan([parts[0]!, parts[1]!, parts[0]!]);

    expect(plans[2]).toEqual({ kind: 'ignore' });
    expect(session.added).toBe(2);
    expect(session.batch?.seen.size).toBe(2);
  });

  test('from a second export does not complete the first', () => {
    // Backed out after two parts and started again. The new export's part 3
    // must not be read as the old export's missing part 3.
    const again = exportCode([{ secret: SECRET_C, name: 'c', issuer: 'Gamma' }], { size: 3, index: 2, id: id + 1 });
    const { plans, session } = scan([parts[0]!, parts[1]!, again]);

    expect(plans[2]).toMatchObject({ kind: 'store', finished: false });
    expect(session.batch).toMatchObject({ id: id + 1 });
    expect(session.batch?.seen.size).toBe(1);
  });

  test('re-exported from the start does not store what it already stored', () => {
    const restart = [
      exportCode([{ secret: SECRET_A, name: 'a', issuer: 'Alpha' }], { size: 3, index: 0, id: id + 1 }),
      exportCode([{ secret: SECRET_B, name: 'b', issuer: 'Beta' }], { size: 3, index: 1, id: id + 1 }),
      exportCode([{ secret: SECRET_C, name: 'c', issuer: 'Gamma' }], { size: 3, index: 2, id: id + 1 }),
    ];
    const { plans, session } = scan([parts[0]!, parts[1]!, ...restart]);

    // Each part of the second export still counts towards finishing it...
    expect(plans.at(-1)).toMatchObject({ kind: 'store', finished: true });
    // ...but only Gamma was new.
    expect(session.added).toBe(3);
    expect(session.skipped).toBe(2);
  });

  test('whose accounts are all in the vault still counts as scanned', () => {
    const existing = importFromText(parts[0]!).items;
    const { plans, session } = scan(parts, existing);

    expect(plans[0]).toMatchObject({ kind: 'store', items: [], finished: false });
    expect(plans.at(-1)).toMatchObject({ finished: true });
    expect(session).toMatchObject({ added: 2, skipped: 1 });
  });

  test('keeps going when a lone code is scanned in the middle of it', () => {
    const { plans } = scan([parts[0]!, single('Delta', SECRET_B)]);
    expect(plans[1]).toMatchObject({ kind: 'store', finished: false });
  });
});

describe('a code that lies about its place in an export', () => {
  // batchSize and batchIndex are written by whoever made the QR. None of these
  // is dangerous, but each would leave a progress line that could never finish
  // or never be right. They fall back to single codes: stored, and done.
  const lie = (size: number, index: number) =>
    exportCode([{ secret: SECRET_A, name: 'a', issuer: 'Alpha' }], { size, index, id: 7 });

  test.each([
    ['part 1 of a million', 1_000_000, 0],
    ['part 7 of 3', 3, 7],
    ['part 1 of 0', 0, 0],
  ])('%s is stored as a single code', (_, size, index) => {
    const { plans } = scan([lie(size, index)]);
    expect(plans[0]).toMatchObject({ kind: 'store', finished: true });
  });
});
