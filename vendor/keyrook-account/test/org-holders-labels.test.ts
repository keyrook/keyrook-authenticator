import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DecryptionError, importDataKey, newCollectionKey, openCollectionHolders } from '../src/index.js';

/**
 * The label of who holds a collection (docs/family.md, Keys):
 * `keyrook.collection-holders:v1:<org>:<collection>:<generation>`, what the
 * list is sealed to under the collection's key — frozen before families are
 * offered, as the 23 of `org-labels.test.ts` were at F11. These fixtures were
 * made once, by the code at keyrook-account b0f0cb4, and are never
 * regenerated: a list one copy of this package sealed must keep opening on a
 * device that copied another, or that collection never gets its next key.
 *
 * A failure here means a label, a parameter or a format changed. Put it back.
 * A new format is a new label beside the old one, never a replacement for it.
 */
const fixture = JSON.parse(readFileSync(new URL('./fixtures/org-holders-labels.json', import.meta.url), 'utf8'));
const { ORG_ID, COLLECTION_ID, GENERATION, MINH_ID, LAN_ID, COLLECTION_KEY } = fixture.inputs;
const place = { orgId: ORG_ID, collectionId: COLLECTION_ID, generation: GENERATION };
const key = () => importDataKey(COLLECTION_KEY);

describe('who holds a collection', () => {
  it('opens under its key, each holder once, in one order (keyrook.collection-holders:v1)', async () => {
    expect(await openCollectionHolders(await key(), fixture.holders, place)).toEqual([LAN_ID, MINH_ID].sort());
  });

  it('opens in no other family, collection or generation, nor under another key', async () => {
    const changes = [{ orgId: 'fam-2' }, { collectionId: 'other' }, { generation: GENERATION + 1 }];
    for (const change of changes) await expect(openCollectionHolders(await key(), fixture.holders, { ...place, ...change }), JSON.stringify(change)).rejects.toBeInstanceOf(DecryptionError);
    await expect(openCollectionHolders(await newCollectionKey(), fixture.holders, place)).rejects.toBeInstanceOf(DecryptionError);
  });
});
