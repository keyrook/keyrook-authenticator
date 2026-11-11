import { describe, expect, it } from 'vitest';
import {
  checkRoster,
  collectionSenderKey,
  leftSince,
  makeRoster,
  mergedOrgPins,
  newCollectionKey,
  newMemberKey,
  newOrgKey,
  nextOrgPin,
  openCollectionHolders,
  orgPinFrom,
  pinnedKey,
  retiredKey,
  sealCollectionHolders,
  sealedHoldersOf,
  trustedOrgPin,
  vouchedFor,
  vouchFor,
  type OrgPin,
  type RosterCheck,
  type RosterMember,
} from '../src/index.js';
import type { OrgBox } from '../src/sync/protocol.js';

/**
 * What a device remembers beside each member's key, so that what someone
 * gone held, or a key someone replaced, is not taken again on the server's
 * say: which keys ended, and how far a collection's keys were seen. Then who
 * holds a collection, as only someone holding its key could say.
 */
const ORG = 'fam-1';
const MINH = 'acc-minh';
const LAN = 'acc-lan';
const HOA = 'acc-hoa';

const line = (accountId: string, memberKey: string, role: RosterMember['role'] = 'member'): RosterMember => ({
  accountId,
  role,
  memberKey,
  verified: true,
  confirmedBy: MINH,
  confirmedAt: 1,
});

async function check(version: number, members: RosterMember[], pin: OrgPin | null): Promise<RosterCheck> {
  const orgKey = await newOrgKey();
  return checkRoster(orgKey, ORG, await makeRoster(orgKey, ORG, 1, version, { members, recoveryKey: null }), pin);
}

/** Lan's device's pin with Minh and Hoa in the family, then the same without Hoa. */
async function hoaWent() {
  const minh = await newMemberKey();
  const lan = await newMemberKey();
  const hoa = await newMemberKey();
  const everyone = [line(MINH, minh.publicKey, 'owner'), line(LAN, lan.publicKey), line(HOA, hoa.publicKey)];
  const before = nextOrgPin(null, await check(1, everyone, null));
  const without = await check(2, everyone.slice(0, 2), before);
  return { minh, lan, hoa, everyone, before, without, after: nextOrgPin(before, without) };
}

describe('a key this device saw end', () => {
  it('stays pinned, as what it handed over still opens, and is retired', async () => {
    const { hoa, after } = await hoaWent();
    expect(pinnedKey(after, HOA)).toBe(hoa.publicKey);
    expect(retiredKey(after, hoa.publicKey)).toBe(true);
  });

  it('is reported as someone who left once: the pin after it has them as gone', async () => {
    const { before, without, after } = await hoaWent();
    expect(leftSince(before, without)).toEqual([HOA]);
    expect(leftSince(after, without)).toEqual([]);
    expect(leftSince(null, without)).toEqual([]);
  });

  it('counts as changed if a roster lists it again, though it is the key pinned', async () => {
    const { everyone, after } = await hoaWent();
    const back = await check(3, everyone, after);
    expect(back.changed).toEqual([HOA]);
    // Not taken back by the next pin, either: it stays retired until compared.
    expect(retiredKey(nextOrgPin(after, back), everyone[2]!.memberKey)).toBe(true);
    expect(retiredKey(nextOrgPin(after, back, [HOA]), everyone[2]!.memberKey)).toBe(false);
  });

  it('comes from a key replaced too, once the new one is taken, and not before', async () => {
    const { everyone, before, hoa } = await hoaWent();
    const newer = await newMemberKey();
    const changed = await check(2, [...everyone.slice(0, 2), line(HOA, newer.publicKey)], before);
    expect(retiredKey(nextOrgPin(before, changed), hoa.publicKey)).toBe(false);
    expect(retiredKey(nextOrgPin(before, changed, [HOA]), hoa.publicKey)).toBe(true);
    expect(retiredKey(trustedOrgPin(before, HOA, newer.publicKey), hoa.publicKey)).toBe(true);
  });

  it('is taken again only on two screens comparing it, and that stands over the copy that had it retired', async () => {
    const { hoa, after } = await hoaWent();
    const newer = await newMemberKey();
    const elsewhere = trustedOrgPin(after, HOA, newer.publicKey);
    const compared = trustedOrgPin(elsewhere, HOA, hoa.publicKey);
    expect(retiredKey(compared, hoa.publicKey)).toBe(false);
    const merged = mergedOrgPins(elsewhere, compared);
    expect(retiredKey(merged, hoa.publicKey)).toBe(false);
    expect(retiredKey(merged, newer.publicKey)).toBe(true);
  });

  it('stays retired when a copy that is behind is merged over one that saw it end', async () => {
    const { hoa, before, after } = await hoaWent();
    expect(retiredKey(mergedOrgPins(after, before), hoa.publicKey)).toBe(true);
    expect(retiredKey(mergedOrgPins(before, after), hoa.publicKey)).toBe(true);
  });

  it('is vouched for by nobody, and vouches for nobody', async () => {
    const { minh, lan, hoa, after, everyone } = await hoaWent();
    const word = await vouchFor(minh, lan.publicKey, { orgId: ORG, memberId: HOA, memberKey: hoa.publicKey, organiserId: MINH, recipientId: LAN });
    const vouches = [{ accountId: HOA, by: MINH, tag: word }];
    const input = { orgId: ORG, me: lan, meId: LAN, members: everyone, vouches, subjects: [HOA] };
    expect(await vouchedFor({ ...input, pin: { ...after, retired: [] } })).toEqual([HOA]);
    expect(await vouchedFor({ ...input, pin: after })).toEqual([]);
    // An organiser gone, whose word the server kept for someone's key.
    const organiserGone = { ...after, retired: [minh.publicKey] };
    expect(await vouchedFor({ ...input, pin: organiserGone })).toEqual([]);
  });
});

describe('a collection key from someone gone', () => {
  const box = (generation: number, senderId = HOA) => ({ collectionId: 'vault', generation, senderId });

  it('opens up to the generation the device had seen, and no further', async () => {
    const { hoa, before, without } = await hoaWent();
    const seen = nextOrgPin(before, without, [], [box(3)]);
    expect(collectionSenderKey(seen, HOA, 'vault', 3)).toBe(hoa.publicKey);
    expect(collectionSenderKey(seen, HOA, 'vault', 2)).toBe(hoa.publicKey);
    expect(collectionSenderKey(seen, HOA, 'vault', 4)).toBeUndefined();
    expect(collectionSenderKey(seen, HOA, 'other', 1)).toBeUndefined();
    // Anyone still in the family: as pinned, whatever the generation.
    expect(collectionSenderKey(seen, MINH, 'vault', 9)).toBe(pinnedKey(seen, MINH));
  });

  it('moves `seen` on only from someone not gone by then, so a later box of theirs cannot', async () => {
    const { hoa, after, without, everyone } = await hoaWent();
    const later = nextOrgPin(after, without, [], [box(5)]);
    expect(collectionSenderKey(later, HOA, 'vault', 5)).toBeUndefined();
    expect(pinnedKey(later, HOA)).toBe(hoa.publicKey);
    // From someone the pin never had, or whose new key is not compared: nothing either.
    expect(nextOrgPin(after, without, [], [box(7, 'acc-unknown')]).seen).toBeUndefined();
    const changed = await check(3, [everyone[0]!, line(LAN, everyone[1]!.memberKey), line(HOA, (await newMemberKey()).publicKey)], after);
    expect(nextOrgPin(after, changed, [], [box(7)]).seen).toBeUndefined();
  });

  it('takes a collection id such as __proto__ as an id, and survives being read back', async () => {
    const { before, without } = await hoaWent();
    const pin = nextOrgPin(before, without, [], [{ collectionId: '__proto__', generation: 2, senderId: HOA }, box(3)]);
    const read = await orgPinFrom(JSON.parse(JSON.stringify(pin)));
    expect(collectionSenderKey(read, HOA, '__proto__', 2)).toBe(pinnedKey(read, HOA));
    expect(collectionSenderKey(read, HOA, 'constructor', 1)).toBeUndefined();
    expect(read.retired).toEqual(pin.retired);
    expect(mergedOrgPins(read, read).seen?.vault).toBe(3);
  });
});

describe('what a pin remembers, as read back', () => {
  it('is absent from a pin with nothing to remember, so one from before reads as it did', async () => {
    const old = { version: 1, generation: 1, keys: { [MINH]: (await newMemberKey()).publicKey } };
    const read = await orgPinFrom(old);
    expect(Object.keys(read)).toEqual(['version', 'generation', 'keys']);
    expect(retiredKey(read, old.keys[MINH])).toBe(false);
  });

  it('is refused when malformed', async () => {
    const pin = { version: 1, generation: 1, keys: {} };
    for (const bad of [{ retired: 'x' }, { retired: ['not a key'] }, { retired: [1] }, { seen: 'x' }, { seen: { vault: 'x' } }, { seen: { vault: 1.5 } }]) {
      await expect(orgPinFrom({ ...pin, ...bad }), JSON.stringify(bad)).rejects.toThrow();
    }
  });
});

describe('who holds a collection, sealed under its key', () => {
  const place = { orgId: ORG, collectionId: 'vault', generation: 2 };

  it('reads back as each holder once, in one order', async () => {
    const key = await newCollectionKey();
    const box = await sealCollectionHolders(key, [LAN, MINH, LAN], place);
    expect(await openCollectionHolders(key, box, place)).toEqual([LAN, MINH].sort());
  });

  it('opens for its own collection and generation under its own key, and no other', async () => {
    const key = await newCollectionKey();
    const holdersBox = (await sealCollectionHolders(key, [MINH], place)) as unknown as OrgBox;
    const collection = { id: 'vault', generation: 2, holdersBox };
    expect(await sealedHoldersOf(key, ORG, collection)).toEqual([MINH]);
    expect(await sealedHoldersOf(await newCollectionKey(), ORG, collection)).toBeNull();
    expect(await sealedHoldersOf(key, ORG, { ...collection, id: 'other' })).toBeNull();
    expect(await sealedHoldersOf(key, ORG, { ...collection, generation: 3 })).toBeNull();
    expect(await sealedHoldersOf(key, 'fam-2', collection)).toBeNull();
  });

  it('is none where the server sends none, or something else', async () => {
    const key = await newCollectionKey();
    expect(await sealedHoldersOf(key, ORG, { id: 'vault', generation: 2 })).toBeNull();
    expect(await sealedHoldersOf(key, ORG, { id: 'vault', generation: 2, holdersBox: { iv: 'x', ct: 'y' } as unknown as OrgBox })).toBeNull();
  });
});
