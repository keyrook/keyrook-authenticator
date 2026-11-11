import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CURVE, publicPointOf } from '../src/crypto/ecdh.js';
import {
  checkRoster,
  DecryptionError,
  exportDataKey,
  fromBase64,
  importDataKey,
  makeRoster,
  openCollectionKey,
  openCollectionName,
  openEmergencyBox,
  openMemberKeyWithProduct,
  openMemberKeyWithRoot,
  openOrgKey,
  openOrgPin,
  openOrgRecord,
  openOrgRecoveryBox,
  openOrgRecoveryKey,
  openOrgTombstone,
  openPagePin,
  openRecoveryHandover,
  orgCompareCode,
  orgJoinCode,
  orgRecoveryCode,
  type AccountRoot,
  type MemberKey,
  type OrgRoster,
} from '../src/index.js';

/**
 * The 23 labels of a family's keys (docs/family.md, Keys) — the eleven HKDF
 * infos and transcript fields `keyrook:v1:member-root-box`,
 * `keyrook:v1:org-key-box`, `keyrook:v1:collection-box`,
 * `keyrook:v1:org-member-confirm`, `keyrook:v1:org-roster`,
 * `keyrook:v1:emergency-box`, `keyrook:v1:org-recovery-key`,
 * `keyrook:v1:org-recovery-box`, `keyrook:v1:org-recovery-code`,
 * `keyrook:v1:org-recovery-handover` and `keyrook:v1:org-page-pin`, and the
 * twelve inputs `keyrook.member-key:v1`, `keyrook.org-key-box:v1`,
 * `keyrook.collection-box:v1`, `keyrook.org-roster:v1`, `keyrook.org-pin:v1`,
 * `keyrook.org-record:v1`, `keyrook.org-tombstone:v1`,
 * `keyrook.collection-name:v1`, `keyrook.emergency:v1`,
 * `keyrook.org-recovery-key:v1`, `keyrook.org-recovery:v1` and
 * `keyrook.org-recovery-handover:v1` — frozen at F11, before anything is
 * stored under them anywhere but a test. These fixtures were made once, by
 * the code at keyrook-account 42c34e0, and are never regenerated: a family's
 * boxes, records and codes made by one copy of this package must keep
 * opening and matching on a device that copied another.
 *
 * A failure here means a label, a parameter or a format changed, and every
 * family's keys, records and pins made since would stop opening. Put it back.
 * A new format is a new label beside the old one, never a replacement for it.
 */
const fixture = JSON.parse(readFileSync(new URL('./fixtures/org-labels.json', import.meta.url), 'utf8'));
const { ORG_ID, MINH_ID, LAN_ID, COLLECTION_ID, RECORD_ID, REQUEST_ID, PRODUCT, GENERATION, VERSION, REV, COLLECTION_NAME, RECORD } = fixture.inputs;
const keys = fixture.publicKeys;
const place = { orgId: ORG_ID, collectionId: COLLECTION_ID, generation: GENERATION };
const recordPlace = { ...place, id: RECORD_ID, rev: REV };
const handover = { orgId: ORG_ID, memberId: LAN_ID, requestId: REQUEST_ID, organiserId: MINH_ID };
const OTHER = '00000000-0000-4000-8000-000000000000';

/** A key pair from the fixture: the private half as made, the public half read from it. */
async function pair(pkcs8: string): Promise<MemberKey & AccountRoot> {
  const privateKey = await crypto.subtle.importKey('pkcs8', fromBase64(pkcs8) as BufferSource, CURVE, true, ['deriveBits']);
  return { privateKey, publicKey: await publicPointOf(privateKey) };
}
const minh = () => pair(fixture.inputs.MINH_MEMBER_PKCS8);
const lan = () => pair(fixture.inputs.LAN_MEMBER_PKCS8);
const lanRoot = () => pair(fixture.inputs.LAN_ROOT_PKCS8);
const fromMinhToLan = async () => ({ recipient: await lan(), recipientId: LAN_ID, senderKey: keys.minh, senderId: MINH_ID });

describe('a member key', () => {
  it('opens from its box under the root (keyrook:v1:member-root-box, keyrook.member-key:v1:<org>:<account>:root)', async () => {
    expect((await openMemberKeyWithRoot(fixture.memberRootBox, await lanRoot(), ORG_ID, LAN_ID)).publicKey).toBe(keys.lan);
  });

  it('opens from its box under a product’s key (keyrook.member-key:v1:<org>:<account>:<product>)', async () => {
    const key = await importDataKey(fixture.inputs.PRODUCT_KEY);
    expect((await openMemberKeyWithProduct(fixture.memberProductBox, key, ORG_ID, LAN_ID, PRODUCT)).publicKey).toBe(keys.lan);
  });
});

describe('a family’s and a collection’s keys', () => {
  it('open the family key from one member to another (keyrook:v1:org-key-box, keyrook.org-key-box:v1)', async () => {
    expect(await exportDataKey(await openOrgKey(fixture.orgKeyBox, await fromMinhToLan(), ORG_ID, GENERATION))).toBe(fixture.inputs.ORG_KEY);
  });

  it('open a collection’s key from one member to another (keyrook:v1:collection-box, keyrook.collection-box:v1)', async () => {
    expect(await exportDataKey(await openCollectionKey(fixture.collectionKeyBox, await fromMinhToLan(), place))).toBe(fixture.inputs.COLLECTION_KEY);
  });

  it('show the same code on both screens when someone joins (keyrook:v1:org-member-confirm), and when two compare', async () => {
    expect(await orgJoinCode({ orgId: ORG_ID, memberId: LAN_ID, memberKey: keys.lan, organiserId: MINH_ID, organiserKey: keys.minh })).toBe(fixture.joinCode);
    const one = { accountId: MINH_ID, memberKey: keys.minh };
    const other = { accountId: LAN_ID, memberKey: keys.lan };
    expect(await orgCompareCode(ORG_ID, one, other)).toBe(fixture.compareCode);
    expect(await orgCompareCode(ORG_ID, other, one)).toBe(fixture.compareCode);
  });
});

describe('the roster', () => {
  it('is MAC’d the same way under the family key (keyrook:v1:org-roster, keyrook.org-roster:v1)', async () => {
    const orgKey = await importDataKey(fixture.inputs.ORG_KEY);
    const roster = fixture.roster as OrgRoster;
    expect(await makeRoster(orgKey, ORG_ID, GENERATION, VERSION, roster.body as never)).toEqual(roster);
    const checked = await checkRoster(orgKey, ORG_ID, roster, null);
    expect(checked.body.members.map((line) => line.memberKey)).toEqual([keys.minh, keys.lan]);
    expect(checked.body.recoveryKey).toBe(keys.recovery);
  });

  it('is pinned under a product’s key (keyrook.org-pin:v1), and by the page under the key only the root makes (keyrook:v1:org-page-pin)', async () => {
    const pin = { version: VERSION, generation: GENERATION, keys: { [MINH_ID]: keys.minh, [LAN_ID]: keys.lan } };
    expect(await openOrgPin(await importDataKey(fixture.inputs.PRODUCT_KEY), fixture.pin, ORG_ID, LAN_ID, PRODUCT)).toEqual(pin);
    expect(await openPagePin(await lanRoot(), fixture.pagePin, ORG_ID, LAN_ID)).toEqual(pin);
  });
});

describe('what a collection holds', () => {
  it('opens its name (keyrook.collection-name:v1)', async () => {
    expect(await openCollectionName(await importDataKey(fixture.inputs.COLLECTION_KEY), fixture.collectionName, place)).toBe(COLLECTION_NAME);
  });

  it('opens a record (keyrook.org-record:v1) and a deletion (keyrook.org-tombstone:v1)', async () => {
    const key = await importDataKey(fixture.inputs.COLLECTION_KEY);
    expect(await openOrgRecord(key, fixture.record, recordPlace)).toEqual(RECORD);
    await expect(openOrgTombstone(key, fixture.tombstone, recordPlace)).resolves.toBeUndefined();
  });
});

describe('a root handed to someone else', () => {
  it('opens for an emergency contact (keyrook:v1:emergency-box, keyrook.emergency:v1)', async () => {
    const to = { recipient: await minh(), recipientId: MINH_ID, senderKey: keys.lan, senderId: LAN_ID };
    expect((await openEmergencyBox(fixture.emergencyBox, to, ORG_ID)).publicKey).toBe(keys.lanRoot);
  });

  it('opens the recovery key from one organiser to another (keyrook:v1:org-recovery-key, keyrook.org-recovery-key:v1)', async () => {
    expect((await openOrgRecoveryKey(fixture.recoveryKeyBox, await fromMinhToLan(), ORG_ID, GENERATION, keys.recovery)).publicKey).toBe(keys.recovery);
  });

  it('opens a member’s root with the recovery key (keyrook:v1:org-recovery-box, keyrook.org-recovery:v1)', async () => {
    const to = { recoveryKey: await pair(fixture.inputs.RECOVERY_PKCS8), accountId: LAN_ID, memberKey: keys.lan };
    expect((await openOrgRecoveryBox(fixture.recoveryBox, to, ORG_ID)).publicKey).toBe(keys.lanRoot);
  });

  it('shows the same code on both screens of a handover (keyrook:v1:org-recovery-code), and opens it (keyrook:v1:org-recovery-handover, keyrook.org-recovery-handover:v1)', async () => {
    expect(await orgRecoveryCode({ ...handover, organiserKey: keys.minh, browserKey: keys.browser })).toBe(fixture.recoveryCode);
    const browser = await pair(fixture.inputs.BROWSER_PKCS8);
    expect((await openRecoveryHandover(fixture.handover, browser, { ...handover, organiserKey: keys.minh })).publicKey).toBe(keys.lanRoot);
  });
});

describe('these fixtures notice a change', () => {
  it('because each box opens only for its own family, account, generation and place', async () => {
    const productKey = await importDataKey(fixture.inputs.PRODUCT_KEY);
    const collectionKey = await importDataKey(fixture.inputs.COLLECTION_KEY);
    const refused = [
      async () => openMemberKeyWithRoot(fixture.memberRootBox, await lanRoot(), OTHER, LAN_ID),
      async () => openMemberKeyWithProduct(fixture.memberProductBox, productKey, ORG_ID, LAN_ID, 'authenticator'),
      async () => openOrgKey(fixture.orgKeyBox, await fromMinhToLan(), ORG_ID, GENERATION + 1),
      async () => openCollectionKey(fixture.collectionKeyBox, await fromMinhToLan(), { ...place, collectionId: OTHER }),
      async () => openOrgRecord(collectionKey, fixture.record, { ...recordPlace, rev: REV + 1 }),
      async () => openOrgPin(productKey, fixture.pin, ORG_ID, MINH_ID, PRODUCT),
      async () => openOrgRecoveryBox(fixture.recoveryBox, { recoveryKey: await pair(fixture.inputs.RECOVERY_PKCS8), accountId: MINH_ID, memberKey: keys.lan }, ORG_ID),
      async () => openRecoveryHandover(fixture.handover, await pair(fixture.inputs.BROWSER_PKCS8), { ...handover, requestId: OTHER, organiserKey: keys.minh }),
    ];
    for (const attempt of refused) await expect(attempt()).rejects.toBeInstanceOf(DecryptionError);
  });

  it('because a record never opens as its deletion, nor a deletion as the record', async () => {
    const key = await importDataKey(fixture.inputs.COLLECTION_KEY);
    await expect(openOrgRecord(key, fixture.tombstone, recordPlace)).rejects.toBeInstanceOf(DecryptionError);
    await expect(openOrgTombstone(key, fixture.record, recordPlace)).rejects.toBeInstanceOf(DecryptionError);
  });

  it('because a code moves with any change to what it covers', async () => {
    expect(await orgJoinCode({ orgId: ORG_ID, memberId: MINH_ID, memberKey: keys.minh, organiserId: LAN_ID, organiserKey: keys.lan })).not.toBe(fixture.joinCode);
    expect(await orgCompareCode(OTHER, { accountId: MINH_ID, memberKey: keys.minh }, { accountId: LAN_ID, memberKey: keys.lan })).not.toBe(fixture.compareCode);
    expect(await orgRecoveryCode({ ...handover, requestId: OTHER, organiserKey: keys.minh, browserKey: keys.browser })).not.toBe(fixture.recoveryCode);
    const changed = { ...fixture.roster, body: { ...fixture.roster.body, recoveryKey: null } };
    await expect(checkRoster(await importDataKey(fixture.inputs.ORG_KEY), ORG_ID, changed, null)).rejects.toThrow();
  });
});
