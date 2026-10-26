import { createCipheriv, pbkdf2Sync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DecryptionError } from '@keyrook/account';
import { importFromText, type ImportResult } from '../src/vault/backup.js';
import {
  recogniseForeignBytes,
  recogniseForeignExport,
  recogniseSteamDesktop,
  type ForeignApp,
  type NamedText,
} from '../src/vault/foreign.js';
import { parseOtpUri } from '../src/otp/uri.js';
import { generateCode } from '../src/otp/totp.js';
import { base32Decode, base32Encode } from '../src/util/base32.js';

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
  .filter((line) => line.startsWith('otpauth://'))
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
      ...(item.type === 'hotp' ? { counter: item.counter } : { period: item.period }),
    }).toEqual({
      type: vector!.type,
      issuer: vector!.issuer,
      label: vector!.label,
      algorithm: vector!.algorithm,
      digits: vector!.digits,
      ...(vector!.type === 'hotp' ? { counter: vector!.counter } : { period: vector!.period }),
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
  it('reads Aegis, plain and locked, Steam Guard included', async () => {
    const plain = await readAs('aegis', json('aegis_plain.json'));
    await expectTheVectors(plain, { atLeast: 7 });
    expect(plain.errors).toEqual([]);
    expect(plain.items.find((item) => item.type === 'steam')).toMatchObject({ issuer: 'Boeing', label: 'Sophia', digits: 5 });

    await expectTheVectors(await readAs('aegis', json('aegis_encrypted.json'), 'test'), { atLeast: 7 });
  });

  it('reads 2FAS, versions 3 and 4, plain and locked', async () => {
    for (const version of ['v3', 'v4']) {
      await expectTheVectors(await readAs('2fas', json(`2fas_authenticator_plain_${version}.2fas`)), { atLeast: 5 });
      await expectTheVectors(await readAs('2fas', json(`2fas_authenticator_encrypted_${version}.2fas`), 'test'), {
        atLeast: 5,
      });
    }
  });

  it('reads andOTP, plain and its locked .json.aes', async () => {
    await expectTheVectors(await readAs('andotp', json('andotp_plain.json')), { atLeast: 7 });

    const locked = recogniseForeignBytes(new Uint8Array(file('otp_accounts.json.aes')), 'otp_accounts.json.aes');
    expect(locked?.needsPassword).toBe(true);
    await expectTheVectors(await locked!.read('test'), { atLeast: 7 });
  });

  it('reads Bitwarden, FreeOTP+ and Proton Authenticator', async () => {
    // Bitwarden and Proton keep time-based codes only: the three TOTP accounts,
    // and Bitwarden's Steam Guard, as steam:// and the key under its own name.
    const bitwarden = await readAs('bitwarden', json('bitwarden.json'));
    expect(bitwarden.errors).toEqual([]);
    const steam = bitwarden.items.find((item) => item.type === 'steam')!;
    expect(steam).toMatchObject({ issuer: 'Test Steam', secret: 'JRZCL47CMXVOQMNPZR2F7J4RGI', digits: 5, period: 30 });
    await expectTheVectors({ items: bitwarden.items.filter((item) => item !== steam), errors: [] }, { atLeast: 3 });
    const sophia = VECTORS.find((vector) => vector.type === 'steam')!;
    expect(await generateCode(steam, 1_700_000_000_000)).toBe(await generateCode(sophia, 1_700_000_000_000));
    await expectTheVectors(await readAs('proton', json('proton_authenticator.json')), { atLeast: 3 });
    // FreeOTP keeps the last counter it showed: the next code is one on.
    await expectTheVectors(await readAs('freeotp', json('freeotp_plus.json')), { atLeast: 6 });
  });

  it('reads Ente Auth’s text export as the otpauth:// links it is', () => {
    const result = importFromText(file('ente_auth.txt').toString('utf8'));
    expect(result.items.length).toBeGreaterThanOrEqual(7);
    expect(result.items.some((item) => item.type === 'steam')).toBe(true);
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

/**
 * Steam Desktop Authenticator's maFiles folder, written as it writes it:
 * the account's JSON, and when it encrypts with a passkey, that JSON under
 * FileEncryptor.EncryptData — PBKDF2 with .NET's default SHA-1, 50,000
 * rounds, an 8-byte salt, into AES-256-CBC with PKCS#7, all in base64, the
 * salt and IV in manifest.json. Made here with node:crypto, which the reader
 * does not use, so the two have to agree on the format and nothing else.
 */
// Codes from Steam's mobile app for this key (otp.test.ts): FR8RV at 1511200518.
const STEAM_KEY = Buffer.from(base32Decode('63BEDWCQZKTQWPESARIERL5DTTQFCJTK'));
const AT = 1511200518_000;

function maFile(account: string, steamId: string, key: Buffer = STEAM_KEY) {
  return JSON.stringify({
    shared_secret: key.toString('base64'),
    serial_number: '3871236187634121890',
    revocation_code: 'R12345',
    uri: `otpauth://totp/Steam:${account}?secret=${base32Encode(key)}&issuer=Steam`,
    server_time: 1511200000,
    account_name: account,
    token_gid: '2a3b4c5d6e7f8091',
    identity_secret: 'aWRlbnRpdHktc2VjcmV0LW5vdC1yZWFk',
    secret_1: 'c2VjcmV0LW9uZQ==',
    status: 1,
    device_id: 'android:0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    fully_enrolled: true,
    Session: { SessionID: 'session', SteamLoginSecure: 'login-secure-token', OAuthToken: 'oauth-token', SteamID: steamId },
  }).replace(`"${steamId}"`, steamId);
}

function sdaEncrypt(passkey: string, salt: Buffer, iv: Buffer, plain: string): string {
  const key = pbkdf2Sync(passkey, salt, 50_000, 32, 'sha1');
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]).toString('base64');
}

/**
 * The folder, encrypted with `passkey`: two accounts, as SDA names their
 * files. Steam ids as text: seventeen digits are more than a JavaScript
 * number holds, and two would round to one name.
 */
function encryptedFolder(passkey: string): NamedText[] {
  const accounts = [
    { steamId: '76561198000000001', account: 'gaben_test' },
    { steamId: '76561198000000002', account: 'second_test' },
  ];
  const entries = accounts.map(({ steamId }, index) => ({
    encryption_iv: Buffer.alloc(16, index + 1).toString('base64'),
    encryption_salt: Buffer.alloc(8, index + 9).toString('base64'),
    filename: `${steamId}.maFile`,
    steamid: steamId,
  }));
  const manifest = JSON.stringify({ encrypted: true, first_run: false, entries, periodic_checking: false });
  return [
    {
      name: 'manifest.json',
      // SDA writes the id as a number.
      text: accounts.reduce((text, { steamId }) => text.replace(`"steamid":"${steamId}"`, `"steamid":${steamId}`), manifest),
    },
    ...accounts.map(({ steamId, account }, index) => ({
      name: entries[index]!.filename,
      text: sdaEncrypt(
        passkey,
        Buffer.from(entries[index]!.encryption_salt, 'base64'),
        Buffer.from(entries[index]!.encryption_iv, 'base64'),
        maFile(account, steamId),
      ),
    })),
  ];
}

describe('Steam Desktop Authenticator’s maFiles', () => {
  it('reads an unencrypted maFile into a Steam Guard account, and nothing else from it', async () => {
    const found = recogniseSteamDesktop([{ name: '76561198000000001.maFile', text: maFile('gaben_test', '76561198000000001') }]);
    expect(found).toMatchObject({ app: 'steamdesktop', needsPassword: false });
    const { items, errors } = await found!.read();
    expect(errors).toEqual([]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ type: 'steam', issuer: 'Steam', label: 'gaben_test', digits: 5, period: 30 });
    expect(await generateCode(items[0]!, AT)).toBe('FR8RV');
    // The trade-confirming key, the revocation code and the session stay in the file.
    const kept = JSON.stringify(items[0]);
    for (const secret of ['aWRlbnRpdHk', 'R12345', 'login-secure-token', 'oauth-token', 'c2VjcmV0LW9uZQ']) {
      expect(kept).not.toContain(secret);
    }
  });

  it('reads one chosen alone as JSON, as a single file goes', async () => {
    const found = recogniseForeignExport(JSON.parse(maFile('gaben_test', '76561198000000001')));
    expect(found?.app).toBe('steamdesktop');
    expect(await generateCode((await found!.read()).items[0]!, AT)).toBe('FR8RV');
  });

  it('reads several unencrypted maFiles chosen together, manifest or not', async () => {
    const folder: NamedText[] = [
      { name: 'manifest.json', text: JSON.stringify({ encrypted: false, first_run: false, entries: [] }) },
      { name: 'a.maFile', text: maFile('one', '76561198000000001') },
      { name: 'b.maFile', text: maFile('two', '76561198000000002') },
      { name: 'notes.txt', text: 'not ours to read' },
    ];
    const { items } = await recogniseSteamDesktop(folder)!.read();
    expect(items.map((item) => item.label)).toEqual(['one', 'two']);
  });

  it('opens an encrypted folder with its passkey', async () => {
    const found = recogniseSteamDesktop(encryptedFolder('correct horse'));
    expect(found).toMatchObject({ app: 'steamdesktop', needsPassword: true });
    const { items, errors } = await found!.read('correct horse');
    expect(errors).toEqual([]);
    expect(items.map((item) => item.label)).toEqual(['gaben_test', 'second_test']);
    for (const item of items) expect(await generateCode(item, AT)).toBe('FR8RV');
  });

  it('refuses a wrong passkey as a wrong password', async () => {
    const found = recogniseSteamDesktop(encryptedFolder('correct horse'))!;
    await expect(found.read('wrong')).rejects.toBeInstanceOf(DecryptionError);
  });

  it('asks for the whole folder when the files chosen cannot be opened alone', () => {
    const [manifest, sealed] = encryptedFolder('correct horse');
    expect(() => recogniseSteamDesktop([sealed!])).toThrow(/maFiles folder/);
    expect(() => recogniseSteamDesktop([manifest!])).toThrow(/maFiles folder/);
    expect(() => recogniseForeignExport(JSON.parse(manifest!.text))).toThrow(/maFiles folder/);
  });

  it('names a maFile its manifest does not list, and reads the rest', async () => {
    const [manifest, first] = encryptedFolder('correct horse');
    const stray = { name: '76561198000000009.maFile', text: first!.text };
    const { items, errors } = await recogniseSteamDesktop([manifest!, first!, stray])!.read('correct horse');
    expect(items).toHaveLength(1);
    expect(errors).toEqual([{ line: stray.name, reason: expect.stringMatching(/maFiles folder/) }]);
  });

  it('turns a maFile with no usable key into a skipped line', async () => {
    const empty = JSON.stringify({ shared_secret: '', account_name: 'empty' });
    const garbled = JSON.stringify({ shared_secret: '%%%', account_name: 'garbled' });
    const { items, errors } = await recogniseSteamDesktop([
      { name: 'a.maFile', text: empty },
      { name: 'b.maFile', text: garbled },
    ])!.read();
    expect(items).toEqual([]);
    expect(errors.map((error) => error.line)).toEqual(['empty', 'garbled']);
  });

  it('leaves alone files that are not its', () => {
    expect(recogniseSteamDesktop([{ name: 'manifest.json', text: '{"name":"some web app"}' }])).toBeNull();
    expect(recogniseSteamDesktop([{ name: 'backup.json', text: '{}' }])).toBeNull();
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
