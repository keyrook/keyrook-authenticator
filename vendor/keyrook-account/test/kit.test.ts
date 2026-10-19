import { describe, expect, it } from 'vitest';
import { crockfordDecode, crockfordEncode, group } from '../src/util/crockford.js';
import {
  generateRecoveryKey,
  isWellFormedRecoveryKey,
  newRecoveryWrap,
  normaliseRecoveryKey,
  RECOVERY_KDF_ITERATIONS,
  RECOVERY_KEY_BYTES,
  unwrapRecoveryWrap,
} from '../src/sync/kit.js';
import { DecryptionError, generateDataKey, openJson, sealJson } from '../src/crypto/aead.js';

/** Whether two data keys are the same key: one seals, the other opens. */
async function sameKey(a: CryptoKey, b: CryptoKey): Promise<boolean> {
  const box = await sealJson(a, 'probe');
  return (await openJson<string>(b, box)) === 'probe';
}

describe('Crockford base32', () => {
  it('round-trips arbitrary bytes', () => {
    const bytes = crypto.getRandomValues(new Uint8Array(20));
    expect(crockfordDecode(crockfordEncode(bytes))).toEqual(bytes);
  });

  it('never emits the confusable letters', () => {
    for (let attempt = 0; attempt < 200; attempt++) {
      const encoded = crockfordEncode(crypto.getRandomValues(new Uint8Array(20)));
      expect(encoded).not.toMatch(/[ILOU]/);
    }
  });

  it('forgives what people actually type', () => {
    const canonical = crockfordEncode(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
    // Lower case, their own spacing, and O/I written where 0/1 were meant.
    const asTyped = group(canonical, 4, ' ')
      .toLowerCase()
      .replace(/0/g, 'O')
      .replace(/1/g, 'l');
    expect(crockfordDecode(asTyped)).toEqual(crockfordDecode(canonical));
  });

  it('rejects a character that is not in the alphabet', () => {
    expect(() => crockfordDecode('ABC$')).toThrow(/not part of a recovery key/);
    expect(() => crockfordDecode('   ')).toThrow(/empty/);
  });

  it('groups for legibility', () => {
    expect(group('ABCDEFGH')).toBe('ABCD-EFGH');
  });
});

describe('recovery keys', () => {
  it('is 160 bits, shown in groups of four', () => {
    const key = generateRecoveryKey();
    expect(key).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){7}$/);
    expect(crockfordDecode(key)).toHaveLength(RECOVERY_KEY_BYTES);
  });

  it('is different every time', () => {
    const keys = new Set(Array.from({ length: 50 }, generateRecoveryKey));
    expect(keys.size).toBe(50);
  });

  it('recognises a well-formed key and rejects a truncated one', () => {
    expect(isWellFormedRecoveryKey(generateRecoveryKey())).toBe(true);
    expect(isWellFormedRecoveryKey('ABCD-EFGH')).toBe(false);
    expect(isWellFormedRecoveryKey('not a key at all!')).toBe(false);
  });

  it('normalises to one canonical form', () => {
    const key = generateRecoveryKey();
    expect(normaliseRecoveryKey(key.toLowerCase().replace(/-/g, ' '))).toBe(
      normaliseRecoveryKey(key),
    );
  });
});

describe('the kit', () => {
  it('opens to the same data key, without the password', async () => {
    const dataKey = await generateDataKey();
    const { wrap, recoveryKey } = await newRecoveryWrap(dataKey);
    expect(await sameKey(dataKey, await unwrapRecoveryWrap(wrap, recoveryKey))).toBe(true);
  });

  it('accepts the key as a person would retype it', async () => {
    const dataKey = await generateDataKey();
    const { wrap, recoveryKey } = await newRecoveryWrap(dataKey);
    const retyped = recoveryKey.toLowerCase().replace(/-/g, ' ').replace(/0/g, 'o');
    expect(await sameKey(dataKey, await unwrapRecoveryWrap(wrap, retyped))).toBe(true);
  });

  it('rejects a different key of the right shape', async () => {
    const { wrap } = await newRecoveryWrap(await generateDataKey());
    await expect(unwrapRecoveryWrap(wrap, generateRecoveryKey())).rejects.toBeInstanceOf(DecryptionError);
  });

  it('says when the input is not a recovery key at all', async () => {
    const { wrap } = await newRecoveryWrap(await generateDataKey());
    // Distinct from "wrong key": someone who pasted their password should not
    // be told their recovery key failed.
    await expect(unwrapRecoveryWrap(wrap, 'correct horse battery staple')).rejects.toThrow(/does not look like/);
  });

  it('holds nothing that reveals the key', async () => {
    const { wrap, recoveryKey } = await newRecoveryWrap(await generateDataKey());
    const serialised = JSON.stringify(wrap);
    expect(serialised).not.toContain(recoveryKey);
    expect(serialised).not.toContain(normaliseRecoveryKey(recoveryKey));
  });

  it('reissued, does not open with the previous key', async () => {
    const dataKey = await generateDataKey();
    const first = await newRecoveryWrap(dataKey);
    const second = await newRecoveryWrap(dataKey);
    await expect(unwrapRecoveryWrap(second.wrap, first.recoveryKey)).rejects.toBeInstanceOf(DecryptionError);
    expect(await sameKey(dataKey, await unwrapRecoveryWrap(second.wrap, second.recoveryKey))).toBe(true);
  });

  it('records its cost in the wrap, at the floor for a 160-bit secret', async () => {
    const { wrap } = await newRecoveryWrap(await generateDataKey());
    expect(wrap.kdf).toMatchObject({ algorithm: 'PBKDF2-SHA256', iterations: RECOVERY_KDF_ITERATIONS });
  });
});
