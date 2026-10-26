import { describe, expect, it } from 'vitest';
import { keepOnlyUnsent, type VaultData, type VaultItem } from '../src/index.js';
import { itemFromUri } from '../src/vault/vault.js';
import { parseOtpUri } from '../src/otp/uri.js';
import { DEFAULT_ACCOUNT, DEFAULT_SETTINGS } from '../src/vault/model.js';

/**
 * A browser the account's owner removed takes the account's codes off itself,
 * and keeps only what the account never received. What has to hold: no
 * change that exists nowhere else is lost, and nothing the account holds
 * unchanged is left behind.
 */
const account = (issuer: string, rev: number, syncedRev: number, deletedAt: number | null = null): VaultItem => ({
  ...itemFromUri(parseOtpUri(`otpauth://totp/${issuer}:me?secret=JBSWY3DPEHPK3PXP&issuer=${issuer}`)),
  rev,
  syncedRev,
  deletedAt,
});

const vault = (items: VaultItem[]): VaultData => ({
  schemaVersion: 1,
  items,
  groups: [{ id: 'work', name: 'Work', color: null, order: 0, updatedAt: 1, deletedAt: null, rev: 1, syncedRev: 0 }],
  settings: { ...DEFAULT_SETTINGS, hideCodes: true },
  account: { ...DEFAULT_ACCOUNT },
  sync: { deviceId: 'here', serverRev: 9, lastSyncAt: 1 },
});

const issuers = (data: VaultData) => data.items.map((item) => item.issuer).sort();

describe('a browser removed from the account', () => {
  it('lets go of what the account holds unchanged', () => {
    const kept = keepOnlyUnsent(vault([account('GitHub', 3, 3), account('Google', 1, 1)]));
    expect(kept.items).toEqual([]);
  });

  it('keeps an account added here that never reached the account', () => {
    const kept = keepOnlyUnsent(vault([account('GitHub', 3, 3), account('Steam', 1, 0)]));
    expect(issuers(kept)).toEqual(['Steam']);
  });

  it('keeps an edit the account never received, as it stands here', () => {
    const edited = { ...account('GitHub', 5, 3), note: 'backup codes in the safe' };
    const kept = keepOnlyUnsent(vault([edited]));
    expect(kept.items).toEqual([edited]);
  });

  it('drops a deletion not yet sent, with what it deleted', () => {
    const kept = keepOnlyUnsent(vault([account('GitHub', 4, 3, Date.now()), account('Old', 2, 0, Date.now())]));
    expect(kept.items).toEqual([]);
  });

  it('leaves this browser’s groups, settings and sync bookkeeping to the caller', () => {
    const before = vault([account('GitHub', 3, 3)]);
    const kept = keepOnlyUnsent(before);
    expect(kept.groups).toEqual(before.groups);
    expect(kept.settings).toEqual(before.settings);
    expect(kept.sync).toEqual(before.sync);
  });
});
