import { describe, expect, it } from 'vitest';
import { generateDataKey, itemToRecord, mergeRecords, pendingItems, type VaultData } from '../src/index.js';
import { itemFromUri } from '../src/vault/vault.js';
import { parseOtpUri } from '../src/otp/uri.js';
import { DEFAULT_ACCOUNT, DEFAULT_SETTINGS } from '../src/vault/model.js';

/**
 * After the account's key is replaced, the server can still hand over records
 * sealed under the old one: sent by a browser that had not yet heard. They
 * must be taken, and sent back under the new key — not skipped as forgeries,
 * which would lose them on every browser that signs in afterwards.
 */
const empty = (): VaultData => ({
  schemaVersion: 1,
  items: [],
  groups: [],
  settings: { ...DEFAULT_SETTINGS },
  account: { ...DEFAULT_ACCOUNT },
  sync: { deviceId: 'here', serverRev: 0, lastSyncAt: null },
});

const account = (issuer: string) => ({
  ...itemFromUri(parseOtpUri(`otpauth://totp/${issuer}:me?secret=JBSWY3DPEHPK3PXP&issuer=${issuer}`)),
  rev: 4,
  syncedRev: 4,
});

describe('records under a key the account replaced', () => {
  it('are taken with the old key, and marked to go up again a revision higher', async () => {
    const oldKey = await generateDataKey();
    const newKey = await generateDataKey();
    const record = await itemToRecord(account('GitHub'), oldKey, 'elsewhere');

    const merged = await mergeRecords(empty(), [record], newKey, [oldKey]);
    expect(merged.rejected).toBe(0);
    const [item] = merged.data.items;
    expect(item).toMatchObject({ issuer: 'GitHub', rev: 5, syncedRev: 4 });
    expect(pendingItems(merged.data)).toHaveLength(1);
  });

  it('opened with the current key, need nothing more', async () => {
    const newKey = await generateDataKey();
    const record = await itemToRecord(account('GitHub'), newKey, 'elsewhere');
    const merged = await mergeRecords(empty(), [record], newKey, [await generateDataKey()]);
    expect(merged.data.items[0]).toMatchObject({ rev: 4, syncedRev: 4 });
    expect(pendingItems(merged.data)).toHaveLength(0);
  });

  it('do not let a key the account never had in: what opens with neither is still refused', async () => {
    const record = await itemToRecord(account('GitHub'), await generateDataKey(), 'elsewhere');
    const merged = await mergeRecords(empty(), [record], await generateDataKey(), [await generateDataKey()]);
    expect(merged.rejected).toBe(1);
    expect(merged.data.items).toHaveLength(0);
  });
});
