import { describe, expect, it } from 'vitest';
import {
  assertUsableBackup,
  exportEncryptedBackup,
  importEncryptedBackup,
  importFromText,
  MAX_BACKUP_KDF_ITERATIONS,
  sanitiseImportedItems,
  type BackupFile,
} from '../src/vault/backup.js';
import { itemFromUri } from '../src/vault/vault.js';
import { parseOtpUri } from '../src/otp/uri.js';
import { newKdfParams } from '@keyrook/account';

const PASSWORD = 'a good backup password';
const GITHUB = 'otpauth://totp/GitHub:octocat?secret=JBSWY3DPEHPK3PXP&issuer=GitHub';

async function realBackup(): Promise<BackupFile> {
  return exportEncryptedBackup([itemFromUri(parseOtpUri(GITHUB))], [], PASSWORD);
}

/**
 * A backup is the one thing a user is invited to accept from outside, and it is
 * read before any password is typed. Everything in the file is attacker-chosen.
 */
describe('a backup file from someone else', () => {
  it('refuses a work factor that would hang the tab', async () => {
    const file = await realBackup();
    // The count lives inside the file. A billion rounds is an afternoon.
    const greedy = { ...file, kdf: { ...file.kdf, iterations: 1_000_000_000 } };

    expect(() => assertUsableBackup(greedy)).toThrow(/unreasonable amount of work/);
    await expect(importEncryptedBackup(greedy, PASSWORD)).rejects.toThrow(/unreasonable/);
    expect(MAX_BACKUP_KDF_ITERATIONS).toBeLessThanOrEqual(10_000_000);
  });

  it('refuses a work factor too low to be protecting anything', async () => {
    const file = await realBackup();
    expect(() => assertUsableBackup({ ...file, kdf: { ...file.kdf, iterations: 10 } })).toThrow();
    expect(() =>
      assertUsableBackup({ ...file, kdf: { ...file.kdf, iterations: 1.5 } }),
    ).toThrow();
  });

  it('refuses an enormous salt', async () => {
    const file = await realBackup();
    expect(() =>
      assertUsableBackup({ ...file, kdf: { ...file.kdf, salt: 'A'.repeat(100_000) } }),
    ).toThrow(/malformed/);
  });

  it('refuses an encryption method it does not know', async () => {
    const file = await realBackup();
    expect(() =>
      assertUsableBackup({ ...file, kdf: { ...file.kdf, algorithm: 'scrypt' as never } }),
    ).toThrow(/does not know/);
  });

  it('refuses one missing the parts it claims to have', async () => {
    const file = await realBackup();
    expect(() => assertUsableBackup({ ...file, payload: {} as never })).toThrow(/malformed/);
    expect(() => assertUsableBackup({ ...file, wrappedKey: null as never })).toThrow();
    expect(() => assertUsableBackup({ format: 'something-else' } as never)).toThrow(/not a Keyrook Authenticator backup/);
  });

  it('still opens an honest one', async () => {
    const file = await realBackup();
    const restored = await importEncryptedBackup(file, PASSWORD);
    expect(restored.items).toHaveLength(1);
    expect(restored.items[0]!.secret).toBe('JBSWY3DPEHPK3PXP');
  });

  it('refuses a text file too large to be a list of links', () => {
    const result = importFromText('x'.repeat(20 * 1024 * 1024));
    expect(result.items).toHaveLength(0);
    expect(result.errors[0]!.reason).toMatch(/too large/);
  });
});

describe('what comes out of a decrypted backup', () => {
  it('drops an account whose secret could never produce a code', () => {
    const clean = sanitiseImportedItems([
      { issuer: 'Good', secret: 'JBSWY3DPEHPK3PXP' },
      { issuer: 'Empty', secret: '' },
      { issuer: 'Junk', secret: 'not base32 at all!!' },
      { issuer: 'Missing' },
    ]);
    expect(clean.map((item) => item.issuer)).toEqual(['Good']);
  });

  it('repairs values the OTP code would throw on', () => {
    const [item] = sanitiseImportedItems([
      { issuer: 'Odd', secret: 'JBSWY3DPEHPK3PXP', digits: 99, period: 0, counter: -5 },
    ]);
    expect(item).toMatchObject({ digits: 6, period: 30, counter: 0 });
  });

  it('gives two accounts sharing an id different ones', () => {
    // Two items with the same id break every lookup that keys on it.
    const clean = sanitiseImportedItems([
      { id: 'same', issuer: 'A', secret: 'JBSWY3DPEHPK3PXP' },
      { id: 'same', issuer: 'B', secret: 'JBSWY3DPEHPK3PXP' },
    ]);
    expect(clean).toHaveLength(2);
    expect(clean[0]!.id).not.toBe(clean[1]!.id);
  });

  it('strips a picture that is not a raster this app made', () => {
    const [item] = sanitiseImportedItems([
      {
        issuer: 'Sneaky',
        secret: 'JBSWY3DPEHPK3PXP',
        icon: 'data:image/svg+xml,<svg onload="alert(1)"/>',
      },
    ]);
    expect(item!.icon).toBeNull();
  });

  it('resets sync bookkeeping, whatever the file claimed', () => {
    // An import is a local change this device has never pushed. A file
    // claiming otherwise would have its accounts skipped on the next sync.
    const [item] = sanitiseImportedItems([
      { issuer: 'A', secret: 'JBSWY3DPEHPK3PXP', rev: 99, syncedRev: 99, deletedAt: 123 },
    ]);
    expect(item).toMatchObject({ rev: 1, syncedRev: 0, deletedAt: null });
  });

  it('survives entries that are not objects at all', () => {
    expect(sanitiseImportedItems([null, undefined, 'x', 42] as never)).toEqual([]);
  });

  it('keeps a restored backup’s own identifiers', async () => {
    const original = itemFromUri(parseOtpUri(GITHUB));
    const backup = await exportEncryptedBackup([original], [], PASSWORD);
    const restored = await importEncryptedBackup(backup, PASSWORD);
    // Restoring your own backup should restore the same accounts, not copies.
    expect(restored.items[0]!.id).toBe(original.id);
  });
});

describe('the KDF floor still applies', () => {
  it('cannot be talked below the minimum by the file', async () => {
    const file = await realBackup();
    const weak = { ...file, kdf: { ...newKdfParams(100_000), iterations: 50_000 } };
    expect(() => assertUsableBackup(weak)).toThrow();
  });
});
