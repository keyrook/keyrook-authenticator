import { describe, expect, it } from 'vitest';
import {
  encodeMigrationUris,
  exportAegisJson,
  exportBitwardenJson,
  exportPlainUris,
  importFromText,
  parseMigrationUri,
  type Group,
  type VaultItem,
} from '../src/index.js';
import { itemFromUri } from '../src/vault/vault.js';
import { buildOtpUri, parseOtpUri } from '../src/otp/uri.js';
import { generateTotp } from '../src/otp/totp.js';

/**
 * Exports to other apps. Each is checked the only way that counts: read back
 * by an importer — ours, which already reads Google's format — and compared
 * with what went in.
 */
const item = (uri: string, overrides: Partial<VaultItem> = {}): VaultItem => ({
  ...itemFromUri(parseOtpUri(uri)),
  ...overrides,
});

const github = item('otpauth://totp/GitHub:octocat@example.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub');
const bank = item(
  'otpauth://totp/Ng%C3%A2n%20h%C3%A0ng:an@example.com?secret=MZXW6YTBOIQWY3DPEB3W64TMMQ&issuer=Ng%C3%A2n%20h%C3%A0ng&algorithm=SHA256&digits=8',
);
const counter = item('otpauth://hotp/Vault:ops@example.com?secret=KRSXG5CTMVRXEZLUGE2TSMJS&issuer=Vault&counter=42');
const slow = item('otpauth://totp/Odd:me@example.com?secret=GEZDGNBVGY3TQOJQ&issuer=Odd&period=60');
const seven = item('otpauth://totp/Seven:me@example.com?secret=NBSWY3DPEB3W64TM&issuer=Seven&digits=7');
const steam = item('otpauth://steam/Steam:gaben?secret=63BEDWCQZKTQWPESARIERL5DTTQFCJTK&issuer=Steam');

const essentials = ({ type, secret, algorithm, digits, counter: count, issuer, label }: VaultItem) => ({
  type,
  secret,
  algorithm,
  digits,
  counter: type === 'hotp' ? count : 0,
  issuer,
  label,
});

describe('to Google Authenticator', () => {
  it('reads back as the accounts that went in', () => {
    const { uris, skipped } = encodeMigrationUris([github, bank, counter]);
    expect(skipped).toEqual([]);
    expect(uris).toHaveLength(1);
    const back = parseMigrationUri(uris[0]!);
    expect(back.items.map((entry) => essentials(entry as VaultItem))).toEqual(
      [github, bank, counter].map(essentials),
    );
  });

  it('splits a long list into codes scanned in order, as one export', () => {
    const many = Array.from({ length: 19 }, (_, index) =>
      item(`otpauth://totp/Service${index}:me@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Service${index}`),
    );
    const { uris } = encodeMigrationUris(many, { batchSize: 8 });
    const batches = uris.map((uri) => parseMigrationUri(uri));
    expect(batches.map((batch) => [batch.batchIndex, batch.batchSize, batch.items.length])).toEqual([
      [0, 3, 8],
      [1, 3, 8],
      [2, 3, 3],
    ]);
    expect(new Set(batches.map((batch) => batch.batchId)).size).toBe(1);
    // Our own importer takes them back, all at once.
    expect(importFromText(uris.join('\n')).items).toHaveLength(19);
  });

  it('leaves out, and says why, what the format would carry wrongly', () => {
    const { uris, skipped } = encodeMigrationUris([github, slow, seven, steam]);
    expect(parseMigrationUri(uris[0]!).items.map((entry) => entry.issuer)).toEqual(['GitHub']);
    expect(skipped.map((entry) => [entry.item.issuer, entry.reason])).toEqual([
      ['Odd', expect.stringMatching(/30-second/)],
      ['Seven', expect.stringMatching(/6- or 8-digit/)],
      ['Steam', 'Google Authenticator cannot make Steam Guard codes.'],
    ]);
  });

  it('gives each export its own id, so a scanner never mixes two', () => {
    const first = parseMigrationUri(encodeMigrationUris([github]).uris[0]!);
    const second = parseMigrationUri(encodeMigrationUris([github]).uris[0]!);
    expect(first.batchId).not.toBe(second.batchId);
  });

  it('produces nothing to scan when nothing fits', () => {
    expect(encodeMigrationUris([slow]).uris).toEqual([]);
  });
});

describe('to an Aegis file', () => {
  const work: Group = { id: 'g1', name: 'Work', color: null, order: 0, updatedAt: 0, deletedAt: null, rev: 1, syncedRev: 0 };
  const unused: Group = { ...work, id: 'g2', name: 'Unused' };
  const gone = item('otpauth://totp/Gone:me@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Gone', { deletedAt: 1 });
  const file = JSON.parse(
    exportAegisJson([{ ...github, groupId: 'g1', note: 'main', favorite: true }, counter, gone], [work, unused]),
  ) as {
    version: number;
    header: { slots: null; params: null };
    db: { version: number; entries: Record<string, unknown>[]; groups: { uuid: string; name: string }[] };
  };

  it('is a plain Aegis vault, version 3', () => {
    expect(file.version).toBe(1);
    expect(file.header).toEqual({ slots: null, params: null });
    expect(file.db.version).toBe(3);
  });

  it('carries every live account with its settings, and none that was deleted', () => {
    expect(file.db.entries.map((entry) => entry.issuer)).toEqual(['GitHub', 'Vault']);
    expect(file.db.entries[0]).toMatchObject({
      type: 'totp',
      name: 'octocat@example.com',
      note: 'main',
      favorite: true,
      icon: null,
      info: { secret: 'JBSWY3DPEHPK3PXP', algo: 'SHA1', digits: 6, period: 30 },
    });
    expect(file.db.entries[1]).toMatchObject({ type: 'hotp', info: { counter: 42 } });
    for (const entry of file.db.entries) {
      expect(entry.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    }
  });

  it('keeps the groups that are in use, by reference', () => {
    expect(file.db.groups.map((group) => group.name)).toEqual(['Work']);
    expect(file.db.entries[0]!.groups).toEqual([file.db.groups[0]!.uuid]);
    expect(file.db.entries[1]!.groups).toEqual([]);
  });

  it('carries Steam Guard as Aegis keeps it', () => {
    const [entry] = (JSON.parse(exportAegisJson([steam], [])) as { db: { entries: Record<string, unknown>[] } }).db.entries;
    expect(entry).toMatchObject({
      type: 'steam',
      issuer: 'Steam',
      name: 'gaben',
      info: { secret: '63BEDWCQZKTQWPESARIERL5DTTQFCJTK', algo: 'SHA1', digits: 5, period: 30 },
    });
  });

  it('writes a typed key canonically, as the setup links do', () => {
    const typed = item('otpauth://totp/T:me?secret=JBSWY3DPEHPK&issuer=T');
    const [entry] = (JSON.parse(exportAegisJson([typed], [])) as { db: { entries: { info: { secret: string } }[] } }).db
      .entries;
    expect(entry!.info.secret).toBe('JBSWY3DPEHPA');
  });
});

describe('to a Bitwarden file', () => {
  const work: Group = { id: 'g1', name: 'Work', color: null, order: 0, updatedAt: 0, deletedAt: null, rev: 1, syncedRev: 0 };
  const gone = item('otpauth://totp/Gone:me@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Gone', { deletedAt: 1 });
  const file = JSON.parse(
    exportBitwardenJson(
      [{ ...github, groupId: 'g1', note: 'main', domains: ['github.com'] }, bank, counter, gone],
      [work],
    ),
  ) as {
    encrypted: boolean;
    folders: { id: string; name: string }[];
    items: {
      type: number;
      name: string;
      notes: string | null;
      folderId: string | null;
      login: { username: string | null; password: null; totp: string; uris: { uri: string }[] };
    }[];
  };

  it('is an unencrypted Bitwarden export of logins, one per live account', () => {
    expect(file.encrypted).toBe(false);
    expect(file.items.map((entry) => entry.name)).toEqual(['GitHub', 'Ngân hàng', 'Vault']);
    expect(file.items.every((entry) => entry.type === 1 && entry.login.password === null)).toBe(true);
  });

  it('carries each account whole in its setup link, settings included', () => {
    const back = file.items.map((entry) => itemFromUri(parseOtpUri(entry.login.totp)));
    expect(back.map(essentials)).toEqual([github, bank, counter].map(essentials));
  });

  it('carries Steam Guard as Bitwarden keeps it, steam:// and the key', () => {
    const [entry] = (JSON.parse(exportBitwardenJson([steam], [])) as typeof file).items;
    expect(entry!.login.totp).toBe('steam://63BEDWCQZKTQWPESARIERL5DTTQFCJTK');
  });

  it('keeps the account name, the note, the sites and the group', () => {
    expect(file.items[0]).toMatchObject({ notes: 'main', folderId: file.folders[0]!.id });
    expect(file.items[0]!.login.username).toBe('octocat@example.com');
    expect(file.items[0]!.login.uris).toEqual([{ match: null, uri: 'https://github.com' }]);
    expect(file.folders.map((folder) => folder.name)).toEqual(['Work']);
    expect(file.items[1]!.folderId).toBeNull();
  });
});

describe('setup links other apps read', () => {
  it('writes a space as %20, never +, so the issuer matches the label prefix in every app', () => {
    const item = parseOtpUri(
      'otpauth://totp/Amazon%20Web%20Services:me%2Bbilling@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Amazon%20Web%20Services',
    );
    const uri = buildOtpUri(item);
    expect(uri).not.toContain('+');
    expect(uri).toContain('issuer=Amazon%20Web%20Services');
    const url = new URL(uri);
    expect(decodeURIComponent(url.pathname.slice(1).split(':')[0]!)).toBe(url.searchParams.get('issuer'));
    expect(parseOtpUri(uri)).toEqual(item);
  });
});

describe('the key in a setup link', () => {
  it('goes out canonical — no padding, no dashes — and still makes the same codes', async () => {
    const padded = parseOtpUri('otpauth://totp/Test:me?secret=KRSXG5CTMVRXEZLUGE2TSMJSGQ======&issuer=Test');
    expect(padded.secret).toContain('=');
    const uri = buildOtpUri(padded);
    expect(uri).toContain('secret=KRSXG5CTMVRXEZLUGE2TSMJSGQ&');
    expect(uri).not.toMatch(/%3D|=$/);

    const now = Date.UTC(2026, 9, 5, 12);
    expect(await generateTotp(parseOtpUri(uri).secret, {}, now)).toBe(await generateTotp(padded.secret, {}, now));
  });

  // Found scanning with Google Authenticator on iOS, which refuses a key whose
  // last letter carries bits past the final byte ("Can't scan this QR code").
  // A key typed by hand ends that way as often as not; the bytes never use them.
  it('zeroes the bits past the last byte, which a strict app will not take', async () => {
    for (const [typed, canonical] of [
      ['JBSWY3DPEHPK', 'JBSWY3DPEHPA'],
      ['JBSWY3DPEHPK3PX', 'JBSWY3DPEHPK3PQ'],
      ['JBSWY3DP', 'JBSWY3DP'],
    ] as const) {
      const item = parseOtpUri(`otpauth://totp/Test:me?secret=${typed}&issuer=Test`);
      const uri = buildOtpUri(item);
      expect(uri).toContain(`secret=${canonical}&`);
      const now = Date.UTC(2026, 9, 5, 12);
      expect(await generateTotp(parseOtpUri(uri).secret, {}, now)).toBe(await generateTotp(item.secret, {}, now));
    }
  });
});

describe('an account with no setup key', () => {
  // What a build before 0.4 restored from an empty entry: no key, no name.
  // Every format carries the key, so it has nothing to give; left in, it
  // threw and took the whole export with it.
  const empty: VaultItem = { ...github, id: 'empty', issuer: '', label: '', secret: '' };

  it('is left out of every export, and the others still go', () => {
    expect(exportPlainUris([github, empty])).toBe(buildOtpUri(github));
    const aegis = JSON.parse(exportAegisJson([github, empty], [])) as { db: { entries: unknown[] } };
    expect(aegis.db.entries).toHaveLength(1);
    const bitwarden = JSON.parse(exportBitwardenJson([github, empty], [])) as { items: unknown[] };
    expect(bitwarden.items).toHaveLength(1);
  });
});
