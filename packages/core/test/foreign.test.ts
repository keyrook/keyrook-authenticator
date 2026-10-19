import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DecryptionError } from '@keyrook/account';
import { importFromText, type ImportResult } from '../src/vault/backup.js';
import { recogniseForeignBytes, recogniseForeignExport, type ForeignApp } from '../src/vault/foreign.js';
import { parseOtpUri } from '../src/otp/uri.js';
import { generateCode } from '../src/otp/totp.js';

/**
 * Other apps' real exports — the files Aegis tests its own importers with —
 * read into exactly the accounts they were made from (`plain.txt`), so a
 * moved account makes the same codes it made before.
 */
const DIR = resolve(import.meta.dirname, 'fixtures/foreign');
const file = (name: string) => readFileSync(resolve(DIR, name));
const json = (name: string) => JSON.parse(file(name).toString('utf8')) as unknown;

/** What each was exported from: six accounts, and one Steam Guard code. */
const VECTORS = file('plain.txt')
  .toString('utf8')
  .split('\n')
  .filter((line) => line.startsWith('otpauth://totp') || line.startsWith('otpauth://hotp'))
  .map(parseOtpUri);

async function expectTheVectors(result: ImportResult, { atLeast }: { atLeast: number }) {
  expect(result.items.length).toBeGreaterThanOrEqual(atLeast);
  for (const item of result.items) {
    const vector = VECTORS.find((candidate) => candidate.secret === item.secret);
    expect(vector, `${item.issuer}: ${item.label}`).toBeDefined();
    expect({
      type: item.type,
      issuer: item.issuer,
      label: item.label,
      algorithm: item.algorithm,
      digits: item.digits,
      ...(item.type === 'totp' ? { period: item.period } : { counter: item.counter }),
    }).toEqual({
      type: vector!.type,
      issuer: vector!.issuer,
      label: vector!.label,
      algorithm: vector!.algorithm,
      digits: vector!.digits,
      ...(vector!.type === 'totp' ? { period: vector!.period } : { counter: vector!.counter }),
    });
    // And the code itself: the point of moving an account.
    expect(await generateCode(item, 1_700_000_000_000)).toBe(await generateCode(vector!, 1_700_000_000_000));
  }
}

async function readAs(app: ForeignApp, parsed: unknown, password?: string): Promise<ImportResult> {
  const found = recogniseForeignExport(parsed);
  expect(found?.app).toBe(app);
  expect(found!.needsPassword).toBe(password !== undefined);
  return found!.read(password);
}

describe('another app’s export', () => {
  it('reads Aegis, plain and locked, and says the Steam code is skipped', async () => {
    const plain = await readAs('aegis', json('aegis_plain.json'));
    await expectTheVectors(plain, { atLeast: 6 });
    expect(plain.errors.map((error) => error.reason)).toEqual(['Steam Guard codes cannot be imported yet.']);
    expect(plain.errors[0]!.line).toBe('Boeing: Sophia');

    await expectTheVectors(await readAs('aegis', json('aegis_encrypted.json'), 'test'), { atLeast: 6 });
  });

  it('reads 2FAS, versions 3 and 4, plain and locked', async () => {
    for (const version of ['v3', 'v4']) {
      await expectTheVectors(await readAs('2fas', json(`2fas_authenticator_plain_${version}.2fas`)), { atLeast: 4 });
      await expectTheVectors(await readAs('2fas', json(`2fas_authenticator_encrypted_${version}.2fas`), 'test'), {
        atLeast: 4,
      });
    }
  });

  it('reads andOTP, plain and its locked .json.aes', async () => {
    await expectTheVectors(await readAs('andotp', json('andotp_plain.json')), { atLeast: 6 });

    const locked = recogniseForeignBytes(new Uint8Array(file('otp_accounts.json.aes')), 'otp_accounts.json.aes');
    expect(locked?.needsPassword).toBe(true);
    await expectTheVectors(await locked!.read('test'), { atLeast: 6 });
  });

  it('reads Bitwarden, FreeOTP+ and Proton Authenticator', async () => {
    // Bitwarden and Proton keep time-based codes only: the three TOTP accounts.
    const bitwarden = await readAs('bitwarden', json('bitwarden.json'));
    await expectTheVectors(bitwarden, { atLeast: 3 });
    expect(bitwarden.errors.map((error) => error.reason)).toEqual(['Steam Guard codes cannot be imported yet.']);
    await expectTheVectors(await readAs('proton', json('proton_authenticator.json')), { atLeast: 3 });
    // FreeOTP keeps the last counter it showed: the next code is one on.
    await expectTheVectors(await readAs('freeotp', json('freeotp_plus.json')), { atLeast: 6 });
  });

  it('reads Ente Auth’s text export as the otpauth:// links it is', () => {
    const result = importFromText(file('ente_auth.txt').toString('utf8'));
    expect(result.items.length).toBeGreaterThanOrEqual(6);
    for (const item of result.items) expect(VECTORS.some((vector) => vector.secret === item.secret)).toBe(true);
  });

  it('reads the Authenticator extension’s backup, hex keys included', async () => {
    const backup = {
      a1: { account: 'Mason', encrypted: false, hash: 'a1', index: 0, issuer: 'Deno', secret: '4SJHB4GSD43FZBAI7C2HLRJGPQ', type: 'totp' },
      b2: { account: 'James', encrypted: false, hash: 'b2', index: 1, issuer: 'SPDX', secret: '5OM4WOOGPLQEF6UGN3CPEOOLWU', type: 'totp', period: 20, digits: 7, algorithm: 'SHA256' },
      // The same key as Issuu's, written in hex.
      c3: { account: 'James', encrypted: false, hash: 'c3', index: 2, issuer: 'Issuu', secret: 'c39cc45ed2e99be8cc2fa14b654edd67', type: 'hhex', counter: 1 },
      d4: { account: 'x', encrypted: false, hash: 'd4', index: 3, issuer: 'Battle.net', secret: 'JBSWY3DPEHPK3PXP', type: 'battle' },
    };
    const result = await readAs('authenticator', backup);
    await expectTheVectors(result, { atLeast: 3 });
    expect(result.errors).toHaveLength(1);
  });
});

describe('a locked export, attacked', () => {
  it('refuses a wrong password as a wrong password, in every locked format', async () => {
    await expect(readAs('aegis', json('aegis_encrypted.json'), 'wrong')).rejects.toBeInstanceOf(DecryptionError);
    await expect(readAs('2fas', json('2fas_authenticator_encrypted_v4.2fas'), 'wrong')).rejects.toBeInstanceOf(
      DecryptionError,
    );
    const andotp = recogniseForeignBytes(new Uint8Array(file('otp_accounts.json.aes')), 'otp_accounts.json.aes')!;
    await expect(andotp.read('wrong')).rejects.toBeInstanceOf(DecryptionError);
  });

  it('will not run a key derivation the file asks too much of', async () => {
    const greedy = json('aegis_encrypted.json') as { header: { slots: { n: number; r: number }[] } };
    greedy.header.slots[0]!.n = 2 ** 24;
    await expect(readAs('aegis', greedy, 'test')).rejects.toThrow(/unreasonable amount of work/);

    const header = new Uint8Array(48);
    new DataView(header.buffer).setUint32(0, 2 ** 31, false);
    expect(() => recogniseForeignBytes(header, 'otp_accounts.json.aes')).toThrow(/unreasonable amount of work/);
  });

  it('names a locked export it cannot open, rather than misreading it', () => {
    expect(() => recogniseForeignExport(json('proton_authenticator_encrypted.json'))).toThrow(/cannot open/);
    expect(() => recogniseForeignExport({ encrypted: true, items: [] })).toThrow(/cannot open/);
    expect(() =>
      recogniseForeignExport({ key1: { dataType: 'Key', id: 'k', salt: 's', hash: 'h', version: 3 } }),
    ).toThrow(/cannot open/);
  });

  it('turns a malformed entry into a skipped line, never an account that cannot make a code', async () => {
    const hostile = {
      version: 1,
      header: { slots: null, params: null },
      db: {
        version: 1,
        entries: [
          { type: 'totp', name: 'a', issuer: 'Bad key', info: { secret: 'not base32!', algo: 'SHA1', digits: 6, period: 30 } },
          { type: 'totp', name: 'b', issuer: 'Odd digits', info: { secret: 'JBSWY3DPEHPK3PXP', digits: 42 } },
          { type: 'totp', name: 'c', issuer: 'Odd hash', info: { secret: 'JBSWY3DPEHPK3PXP', algo: 'MD5' } },
          { type: 'motp', name: 'd', issuer: 'mOTP', info: { secret: 'JBSWY3DPEHPK3PXP' } },
          'not even an object',
        ],
      },
    };
    const result = await readAs('aegis', hostile);
    expect(result.items).toEqual([]);
    expect(result.errors).toHaveLength(5);
  });

  it('leaves alone what is not another app’s export', () => {
    expect(recogniseForeignExport({ format: 'authx.backup' })).toBeNull();
    expect(recogniseForeignExport('otpauth://totp/x?secret=JBSWY3DPEHPK3PXP')).toBeNull();
    expect(recogniseForeignExport([1, 2, 3])).toBeNull();
    expect(recogniseForeignBytes(new Uint8Array(64), 'photo.png')).toBeNull();
  });
});
