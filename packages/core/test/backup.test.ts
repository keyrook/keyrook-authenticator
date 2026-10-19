import { describe, expect, it } from 'vitest';
import { DecryptionError } from '@keyrook/account';
import {
  dedupeAgainst,
  exportEncryptedBackup,
  exportPlainUris,
  importEncryptedBackup,
  importFromText,
  isBackupFile,
} from '../src/vault/backup.js';
import { itemFromUri } from '../src/vault/vault.js';
import { parseOtpUri } from '../src/otp/uri.js';

const GITHUB = 'otpauth://totp/GitHub:octocat?secret=JBSWY3DPEHPK3PXP&issuer=GitHub';
const GITLAB = 'otpauth://totp/GitLab:dev?secret=MZXW6YTBOI&issuer=GitLab';

describe('encrypted backup', () => {
  it('round-trips through export and import', async () => {
    const items = [itemFromUri(parseOtpUri(GITHUB)), itemFromUri(parseOtpUri(GITLAB))];
    const backup = await exportEncryptedBackup(items, [], 'a good backup password');

    expect(isBackupFile(backup)).toBe(true);
    expect(JSON.stringify(backup)).not.toContain('JBSWY3DPEHPK3PXP');

    const restored = await importEncryptedBackup(backup, 'a good backup password');
    expect(restored.items.map((item) => item.issuer)).toEqual(['GitHub', 'GitLab']);
    expect(restored.items[0]!.secret).toBe('JBSWY3DPEHPK3PXP');
  });

  it('rejects the wrong password', async () => {
    const backup = await exportEncryptedBackup([itemFromUri(parseOtpUri(GITHUB))], [], 'password one');
    await expect(importEncryptedBackup(backup, 'password two')).rejects.toBeInstanceOf(
      DecryptionError,
    );
  });

  it('requires a password of at least 8 characters', async () => {
    await expect(exportEncryptedBackup([], [], 'short')).rejects.toThrow(/at least 8/);
  });

  it('omits deleted items', async () => {
    const live = itemFromUri(parseOtpUri(GITHUB));
    const gone = { ...itemFromUri(parseOtpUri(GITLAB)), deletedAt: Date.now() };
    const backup = await exportEncryptedBackup([live, gone], [], 'a good backup password');
    const restored = await importEncryptedBackup(backup, 'a good backup password');
    expect(restored.items).toHaveLength(1);
  });

  it('refuses a file that is not a backup', async () => {
    await expect(
      importEncryptedBackup({ format: 'something-else' } as never, 'a good backup password'),
    ).rejects.toThrow(/not a Keyrook Authenticator backup/);
  });
});

describe('plain-text export', () => {
  it('emits one otpauth URI per live item', () => {
    const items = [itemFromUri(parseOtpUri(GITHUB)), itemFromUri(parseOtpUri(GITLAB))];
    const text = exportPlainUris(items);
    expect(text.split('\n')).toHaveLength(2);
    expect(importFromText(text).items.map((item) => item.issuer)).toEqual(['GitHub', 'GitLab']);
  });
});

describe('importFromText', () => {
  it('reads several URIs and skips blanks and comments', () => {
    const result = importFromText(`\n# my accounts\n${GITHUB}\n\n${GITLAB}\n`);
    expect(result.items).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  it('collects a reason for every unreadable line', () => {
    const result = importFromText(`${GITHUB}\nnot a uri\notpauth://totp/x`);
    expect(result.items).toHaveLength(1);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]!.reason).toMatch(/Not an otpauth/);
    expect(result.errors[1]!.reason).toMatch(/missing the "secret"/);
  });

  it('truncates long lines in the error report', () => {
    const long = `otpauth://totp/${'x'.repeat(200)}`;
    expect(importFromText(long).errors[0]!.line).toHaveLength(61);
  });
});

describe('dedupeAgainst', () => {
  it('separates new accounts from ones already present', () => {
    const existing = [itemFromUri(parseOtpUri(GITHUB))];
    const incoming = [itemFromUri(parseOtpUri(GITHUB)), itemFromUri(parseOtpUri(GITLAB))];

    const { fresh, duplicates } = dedupeAgainst(existing, incoming);
    expect(fresh.map((item) => item.issuer)).toEqual(['GitLab']);
    expect(duplicates).toHaveLength(1);
  });

  it('deduplicates within the incoming batch too', () => {
    const incoming = [itemFromUri(parseOtpUri(GITHUB)), itemFromUri(parseOtpUri(GITHUB))];
    expect(dedupeAgainst([], incoming).fresh).toHaveLength(1);
  });

  it('treats a deleted item as absent', () => {
    const existing = [{ ...itemFromUri(parseOtpUri(GITHUB)), deletedAt: Date.now() }];
    expect(dedupeAgainst(existing, [itemFromUri(parseOtpUri(GITHUB))]).fresh).toHaveLength(1);
  });
});
