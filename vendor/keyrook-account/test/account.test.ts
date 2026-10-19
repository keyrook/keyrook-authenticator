import { hkdfSync, pbkdf2Sync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  accountPasswordProblem,
  assertAcceptableAccountKdf,
  authHashEquals,
  deriveAccountKeys,
  DEFAULT_ACCOUNT_ITERATIONS,
  newAccountKdfParams,
  type AccountKdfParams,
} from '../src/sync/account.js';
import {
  generateDataKey,
  openJson,
  sealJson,
  unwrapDataKey,
  wrapDataKey,
  DecryptionError,
} from '../src/crypto/aead.js';
import { fromBase64, toBase64 } from '../src/util/bytes.js';
import {
  deriveKeyCheck,
  deriveRecoveryAuthHash,
  openRecoveryState,
  sealRecoveryState,
} from '../src/sync/recovery.js';
import { generateRecoveryKey, newRecoveryWrap, unwrapRecoveryWrap } from '../src/sync/kit.js';

const PASSWORD = 'correct horse battery staple';
// Fixed salt and the lowest accepted cost, so the suite stays quick and the
// assertions stay deterministic.
const PARAMS: AccountKdfParams = {
  algorithm: 'PBKDF2-SHA256',
  iterations: 100_000,
  salt: toBase64(new Uint8Array(16).fill(7)),
};

describe('account key derivation', () => {
  it('is deterministic for the same password and parameters', async () => {
    const first = await deriveAccountKeys(PASSWORD, PARAMS);
    const second = await deriveAccountKeys(PASSWORD, PARAMS);
    expect(first.authHash).toBe(second.authHash);
  });

  it('produces a different auth hash for a different password', async () => {
    const right = await deriveAccountKeys(PASSWORD, PARAMS);
    const wrong = await deriveAccountKeys('correct horse battery stapl', PARAMS);
    expect(wrong.authHash).not.toBe(right.authHash);
  });

  it('produces a different auth hash for a different salt', async () => {
    const a = await deriveAccountKeys(PASSWORD, PARAMS);
    const b = await deriveAccountKeys(PASSWORD, { ...PARAMS, salt: toBase64(new Uint8Array(16)) });
    expect(a.authHash).not.toBe(b.authHash);
  });

  it('keeps the encryption key off the wire and out of reach', async () => {
    const keys = await deriveAccountKeys(PASSWORD, PARAMS);

    // The half that is sent to the server is a plain string...
    expect(typeof keys.authHash).toBe('string');
    // ...and the half that decrypts the vault cannot be read out at all, so a
    // bug that logs or uploads "the key" cannot leak the real one.
    expect(keys.stretchedKey.extractable).toBe(false);
    await expect(crypto.subtle.exportKey('raw', keys.stretchedKey)).rejects.toThrow();
  });

  it('gives the server a value that cannot be turned back into the vault key', async () => {
    const keys = await deriveAccountKeys(PASSWORD, PARAMS);

    // Treat the auth hash as if it leaked, and try to use it as the wrapping
    // key. It must not open anything.
    const leaked = await crypto.subtle.importKey(
      'raw',
      Uint8Array.from(atob(keys.authHash), (c) => c.charCodeAt(0)) as BufferSource,
      { name: 'AES-GCM' },
      false,
      ['wrapKey', 'unwrapKey'],
    );

    const dataKey = await generateDataKey();
    const protectedKey = await wrapDataKey(keys.stretchedKey, dataKey);
    await expect(unwrapDataKey(leaked, protectedKey)).rejects.toBeInstanceOf(DecryptionError);
  });

  it('round-trips the data key through the protected-key blob', async () => {
    const keys = await deriveAccountKeys(PASSWORD, PARAMS);
    const dataKey = await generateDataKey();
    const protectedKey = await wrapDataKey(keys.stretchedKey, dataKey);

    // A second device derives the same stretched key from the password alone.
    const elsewhere = await deriveAccountKeys(PASSWORD, PARAMS);
    const recovered = await unwrapDataKey(elsewhere.stretchedKey, protectedKey);

    const message = new TextEncoder().encode('hello from device one');
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const sealed = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, dataKey, message);
    const opened = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, recovered, sealed);
    expect(new TextDecoder().decode(opened)).toBe('hello from device one');
  });

  // Passhold signs in to the same Keyrook account and derives these keys on
  // its own, so the derivation is a published format: a changed label or step
  // here would sign everyone out of the other product. Worked out again with
  // Node's crypto, step by step, from the header of sync/account.ts.
  it('matches the derivation another product repeats on its own', async () => {
    const master = pbkdf2Sync(PASSWORD.normalize('NFKC'), fromBase64(PARAMS.salt), PARAMS.iterations, 32, 'sha256');
    const expand = (info: string) => new Uint8Array(hkdfSync('sha256', master, new Uint8Array(0), info, 32));

    const keys = await deriveAccountKeys(PASSWORD, PARAMS);
    expect(keys.authHash).toBe(toBase64(expand('authx:v1:auth')));

    const theirs = await crypto.subtle.importKey('raw', expand('authx:v1:enc'), { name: 'AES-GCM' }, false, [
      'wrapKey',
      'unwrapKey',
    ]);
    const dataKey = await generateDataKey();
    await expect(unwrapDataKey(theirs, await wrapDataKey(keys.stretchedKey, dataKey))).resolves.toBeTruthy();
  });

  it('refuses a weakened iteration count', async () => {
    await expect(deriveAccountKeys(PASSWORD, { ...PARAMS, iterations: 1_000 })).rejects.toThrow(
      /below the safe minimum/,
    );
  });

  it('refuses an unknown KDF rather than guessing', async () => {
    await expect(
      deriveAccountKeys(PASSWORD, { ...PARAMS, algorithm: 'scrypt' as never }),
    ).rejects.toThrow(/Unsupported account KDF/);
  });

  it('generates fresh random salts', () => {
    expect(newAccountKdfParams().salt).not.toBe(newAccountKdfParams().salt);
    expect(newAccountKdfParams().iterations).toBe(600_000);
  });
});

describe('authHashEquals', () => {
  it('matches identical hashes and rejects everything else', () => {
    expect(authHashEquals('abc123', 'abc123')).toBe(true);
    expect(authHashEquals('abc123', 'abc124')).toBe(false);
    expect(authHashEquals('abc123', 'abc12')).toBe(false);
    expect(authHashEquals('', '')).toBe(true);
  });
});

describe('refusing parameters the server made up', () => {
  const sound = { ...PARAMS, iterations: DEFAULT_ACCOUNT_ITERATIONS };

  it('accepts what this client would have chosen', () => {
    expect(() => assertAcceptableAccountKdf(sound)).not.toThrow();
    expect(() =>
      assertAcceptableAccountKdf({ ...sound, iterations: DEFAULT_ACCOUNT_ITERATIONS * 2 }),
    ).not.toThrow();
  });

  it('refuses a cheaper derivation than it would have picked', () => {
    // prelogin answers before anything is authenticated. A server that replies
    // with a low count gets an authHash that is far cheaper to attack offline —
    // which would quietly undo the one property this design exists for.
    expect(() => assertAcceptableAccountKdf({ ...sound, iterations: 100_000 })).toThrow(
      /below the .* this app requires/,
    );
    expect(() => assertAcceptableAccountKdf({ ...sound, iterations: 1 })).toThrow();
  });

  it('refuses a salt short enough to precompute against', () => {
    expect(() =>
      assertAcceptableAccountKdf({ ...sound, salt: toBase64(new Uint8Array(4)) }),
    ).toThrow(/too short a salt/);
    expect(() => assertAcceptableAccountKdf({ ...sound, salt: '' })).toThrow(/too short a salt/);
  });

  it('refuses an algorithm it does not know', () => {
    expect(() =>
      assertAcceptableAccountKdf({ ...sound, algorithm: 'PBKDF2-MD5' as never }),
    ).toThrow(/unsupported KDF/);
  });
});

describe('what a password must be before the vault leaves the device', () => {
  it('turns away the passwords a cracker tries first', () => {
    for (const weak of ['password1', 'hunter2hunter2', '12345678901234567890', 'Summer2026']) {
      expect(accountPasswordProblem(weak), weak).not.toBeNull();
    }
  });

  it('accepts a long passphrase of plain words, and a shorter mixed one', () => {
    expect(accountPasswordProblem('correct horse battery staple')).toBeNull();
    expect(accountPasswordProblem('Tr0ub4dor&3xyz')).toBeNull();
  });
});

describe('proofs derived from the keys', () => {
  it('proves holding the data key without handing over anything that opens it', async () => {
    const dataKey = await generateDataKey();
    const check = await deriveKeyCheck(dataKey);
    expect(await deriveKeyCheck(dataKey)).toBe(check);

    // Using the check itself as a key must not open what the data key sealed.
    const sealed = await sealJson(dataKey, { secret: 'JBSWY3DPEHPK3PXP' });
    const asKey = await crypto.subtle.importKey(
      'raw',
      fromBase64(check) as BufferSource,
      { name: 'AES-GCM' },
      false,
      ['decrypt'],
    );
    await expect(openJson(asKey, sealed)).rejects.toBeInstanceOf(DecryptionError);
    expect(await deriveKeyCheck(await generateDataKey())).not.toBe(check);
  });

  it('derives the recovery proof from the key however it was typed', async () => {
    const key = generateRecoveryKey();
    const typed = key.toLowerCase().replaceAll('-', ' ');
    expect(await deriveRecoveryAuthHash(typed)).toBe(await deriveRecoveryAuthHash(key));
    expect(await deriveRecoveryAuthHash(generateRecoveryKey())).not.toBe(
      await deriveRecoveryAuthHash(key),
    );
  });

  it('keeps the recovery proof apart from the key that unwraps the kit', async () => {
    // The server stores the proof. If it could unwrap the kit with it, the kit
    // would be as good as handed over.
    const dataKey = await generateDataKey();
    const { wrap, recoveryKey } = await newRecoveryWrap(dataKey);
    const proof = await deriveRecoveryAuthHash(recoveryKey);
    const asKek = await crypto.subtle.importKey(
      'raw',
      fromBase64(proof) as BufferSource,
      { name: 'AES-GCM' },
      false,
      ['unwrapKey'],
    );
    await expect(unwrapDataKey(asKek, wrap.wrappedKey)).rejects.toBeInstanceOf(DecryptionError);
    await expect(unwrapRecoveryWrap(wrap, recoveryKey)).resolves.toBeTruthy();
  });

  it('seals a kit state that opens only under the same data key', async () => {
    const dataKey = await generateDataKey();
    const state = { wrap: null, issuedAt: 1_700_000_000_000 };
    const box = await sealRecoveryState(dataKey, state);
    expect(await openRecoveryState(dataKey, box)).toEqual(state);
    await expect(openRecoveryState(await generateDataKey(), box)).rejects.toBeInstanceOf(DecryptionError);
    // A record box from the same key is not a kit state: the label differs.
    await expect(openRecoveryState(dataKey, await sealJson(dataKey, state))).rejects.toBeInstanceOf(
      DecryptionError,
    );
  });
});
